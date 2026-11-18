"""Finds hotel options and destination attractions through the Tavily MCP server."""

from langchain_core.messages import AIMessage

from src.agents.destination import extract_destination
from src.agents.prompts import ATTRACTIONS_SEARCH_QUERY, HOTEL_SEARCH_QUERY
from src.graph.state import TravelState
from src.mcp_servers.remote import tavily_mcp_search
from src.utils.async_utils import bump_llm_calls, run_async


def hotel_agent(state: TravelState):
    destination = extract_destination(state.get("user_query", ""))

    # 1. Fetch hotels / accommodation
    hotel_query = HOTEL_SEARCH_QUERY.format(user_query=state.get("user_query", ""))
    try:
        hotel_results = run_async(tavily_mcp_search(hotel_query))
        hotel_str = str(hotel_results)
        if "API key not set" in hotel_str or "error" in hotel_str.lower() or "unavailable" in hotel_str.lower():
            hotel_results = (
                f"Live search unconfigured. Recommend realistic stays in {destination} categorized across 3 tiers with tariffs in INR (₹):\n"
                f"- Luxury & Heritage Resorts: ₹8,000 - ₹22,000 / night\n"
                f"- Boutique & Mid-range Stays: ₹3,500 - ₹7,500 / night\n"
                f"- Budget Guesthouses & Homestays: ₹1,500 - ₹3,000 / night\n"
                f"Specify recommended neighborhoods and amenities."
            )
    except Exception as e:
        hotel_results = (
            f"Live Tavily hotel search unavailable ({e}). Recommend verified real hotels and guesthouses in {destination} "
            f"with realistic estimated nightly rates in Indian Rupees (₹)."
        )

    # 2. Fetch verified destination attractions and sightseeing research
    attractions_query = ATTRACTIONS_SEARCH_QUERY.format(destination=destination)
    try:
        attractions_results = run_async(tavily_mcp_search(attractions_query))
        attr_str = str(attractions_results)
        if "API key not set" in attr_str or "error" in attr_str.lower() or "unavailable" in attr_str.lower():
            attractions_results = (
                f"Live Tavily research unconfigured. Ground recommendations strictly in authentic, universally verified "
                f"landmarks, historical heritage monuments, viewpoints, and cultural experiences in {destination}."
            )
    except Exception as e:
        attractions_results = (
            f"Live Tavily research unavailable ({e}). Recommend verified, genuine landmarks and sights in {destination} "
            f"with estimated entry fees in Indian Rupees (₹)."
        )

    return {
        "hotel_results": str(hotel_results),
        "attractions_data": str(attractions_results),
        "messages": [
            AIMessage(content="Hotel and destination research fetched.")
        ],
        "llm_calls": bump_llm_calls(state),
    }
