"""Finds hotel options and destination attractions through the Tavily MCP server."""

from langchain_core.messages import AIMessage

from src.agents.destination import extract_destination
from src.agents.prompts import ATTRACTIONS_SEARCH_QUERY, HOTEL_SEARCH_QUERY
from src.graph.state import TravelState
from src.mcp_servers.remote import tavily_mcp_search
from src.utils.async_utils import bump_llm_calls, run_async


def hotel_agent(state: TravelState):
    # 1. Fetch hotels / accommodation
    hotel_query = HOTEL_SEARCH_QUERY.format(user_query=state["user_query"])
    try:
        hotel_results = run_async(tavily_mcp_search(hotel_query))
    except Exception as e:
        hotel_results = f"Hotel information unavailable: {str(e)}"

    # 2. Fetch verified destination attractions and sightseeing research
    destination = extract_destination(state["user_query"])
    attractions_query = ATTRACTIONS_SEARCH_QUERY.format(destination=destination)
    try:
        attractions_results = run_async(tavily_mcp_search(attractions_query))
    except Exception as e:
        attractions_results = f"Attractions research unavailable: {str(e)}"

    return {
        "hotel_results": str(hotel_results),
        "attractions_data": str(attractions_results),
        "messages": [
            AIMessage(content="Hotel and destination research fetched.")
        ],
        "llm_calls": bump_llm_calls(state),
    }
