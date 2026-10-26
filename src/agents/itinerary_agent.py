"""Combines flight, hotel, weather and destination research into a day-by-day itinerary."""

from langchain_core.messages import HumanMessage, SystemMessage

from src.agents.destination import extract_destination
from src.agents.prompts import (
    ATTRACTIONS_SEARCH_QUERY,
    ITINERARY_AGENT_PROMPT,
    ITINERARY_SYSTEM_PROMPT,
)
from src.clients.llm import get_llm
from src.graph.state import TravelState
from src.mcp_servers.remote import tavily_mcp_search
from src.utils.async_utils import bump_llm_calls, run_async


def itinerary_agent(state: TravelState):
    attractions_data = state.get("attractions_data", "")
    if not attractions_data or not str(attractions_data).strip():
        # Integrate Tavily search for attractions if not already in state
        try:
            destination = extract_destination(state["user_query"])
            attractions_query = ATTRACTIONS_SEARCH_QUERY.format(destination=destination)
            attractions_data = run_async(tavily_mcp_search(attractions_query))
        except Exception as e:
            attractions_data = f"Attractions research unavailable: {str(e)}"

    prompt = ITINERARY_AGENT_PROMPT.format(
        user_query=state.get("user_query", ""),
        attractions_data=str(attractions_data),
        flight_results=state.get("flight_results", ""),
        hotel_results=state.get("hotel_results", ""),
        weather_results=state.get("weather_results", ""),
    )

    response = get_llm().invoke([
        SystemMessage(content=ITINERARY_SYSTEM_PROMPT),
        HumanMessage(content=prompt),
    ])

    return {
        "itinerary": response.content,
        "attractions_data": str(attractions_data),
        "messages": [response],
        "llm_calls": bump_llm_calls(state),
    }
