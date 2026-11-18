"""Turns the user query into concrete flight guidance using AviationStack MCP."""

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from src.agents.prompts import FLIGHT_AGENT_PROMPT, FLIGHT_SYSTEM_PROMPT
from src.clients.llm import get_llm
from src.config.settings import (
    AIRLINE_DATA_CHAR_LIMIT,
    AIRPORT_DATA_CHAR_LIMIT,
)
from src.graph.state import TravelState
from src.mcp_servers.local import aviation_mcp_call
from src.utils.async_utils import bump_llm_calls, run_async, truncate


def flight_agent(state: TravelState):
    query = state["user_query"]

    try:
        airports = run_async(aviation_mcp_call("list_airports"))
        airlines = run_async(aviation_mcp_call("list_airlines"))

        airports_str = str(airports)
        airlines_str = str(airlines)

        if "API key not set" in airports_str or "error" in airports_str.lower():
            airport_data = (
                "Live AviationStack data not connected. Suggest standard commercial routes, "
                "origin/destination airport codes (e.g. DEL, BOM, BLR, GOI), flight durations, "
                "and realistic round-trip airfares in Indian Rupees (₹)."
            )
        else:
            airport_data = truncate(airports, AIRPORT_DATA_CHAR_LIMIT)

        if "API key not set" in airlines_str or "error" in airlines_str.lower():
            airline_data = "Major domestic and international carriers (e.g. IndiGo, Air India, Vistara, Akasa Air)."
        else:
            airline_data = truncate(airlines, AIRLINE_DATA_CHAR_LIMIT)

        prompt = FLIGHT_AGENT_PROMPT.format(
            query=query,
            airport_data=airport_data,
            airline_data=airline_data,
        )

        response = get_llm().invoke([
            SystemMessage(content=FLIGHT_SYSTEM_PROMPT),
            HumanMessage(content=prompt),
        ])

        flight_data = response.content

    except Exception as e:
        flight_data = f"Flight information unavailable: {str(e)}"

    return {
        "flight_results": flight_data,
        "messages": [
            AIMessage(content="Flight recommendations generated")
        ],
        "llm_calls": bump_llm_calls(state),
    }
