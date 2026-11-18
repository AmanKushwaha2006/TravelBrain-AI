"""Combines flight, hotel, weather and destination research into a day-by-day itinerary."""

from langchain_core.messages import HumanMessage, SystemMessage

from src.agents.destination import extract_destination
from src.agents.prompts import (
    ATTRACTIONS_SEARCH_QUERY,
    ITINERARY_AGENT_PROMPT,
    ITINERARY_SYSTEM_PROMPT,
)
from src.clients.llm import extract_message_content, get_llm
from src.graph.state import TravelState
from src.mcp_servers.remote import tavily_mcp_search
from src.utils.async_utils import bump_llm_calls, run_async


def itinerary_agent(state: TravelState):
    destination = extract_destination(state.get("user_query", ""))
    attractions_data = state.get("attractions_data", "")

    if not attractions_data or "unavailable" in str(attractions_data).lower() or not str(attractions_data).strip():
        try:
            attractions_query = ATTRACTIONS_SEARCH_QUERY.format(destination=destination)
            search_res = run_async(tavily_mcp_search(attractions_query))
            res_str = str(search_res)
            if "API key not set" in res_str or "error" in res_str.lower() or "unavailable" in res_str.lower():
                attractions_data = (
                    f"Live search unconfigured. Ground the itinerary in genuine, universally verified "
                    f"landmarks, historical heritage monuments, scenic viewpoints, and cultural experiences in {destination}."
                )
            else:
                attractions_data = res_str
        except Exception:
            attractions_data = (
                f"Live search unavailable. Recommend verified, genuine landmarks and sights in {destination} "
                f"with realistic transit pacing and entry fees in Indian Rupees (₹)."
            )

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

    itinerary_text = extract_message_content(response)

    return {
        "itinerary": itinerary_text,
        "attractions_data": str(attractions_data),
        "messages": [response],
        "llm_calls": bump_llm_calls(state),
    }
