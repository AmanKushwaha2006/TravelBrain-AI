"""Formats everything the other agents produced into the user-facing answer."""

from langchain_core.messages import HumanMessage, SystemMessage

from src.agents.prompts import FINAL_AGENT_PROMPT, FINAL_SYSTEM_PROMPT
from src.clients.llm import get_llm
from src.graph.state import TravelState
from src.utils.async_utils import bump_llm_calls


def final_agent(state: TravelState):
    itinerary_text = state.get("itinerary", "")
    if not itinerary_text or not itinerary_text.strip():
        itinerary_text = "Detailed day-by-day itinerary structured chronologically across the destination's top sights."

    prompt = FINAL_AGENT_PROMPT.format(
        user_query=state.get("user_query", ""),
        flight_results=state.get("flight_results", ""),
        hotel_results=state.get("hotel_results", ""),
        weather_results=state.get("weather_results", ""),
        itinerary=itinerary_text,
    )

    response = get_llm().invoke([
        SystemMessage(content=FINAL_SYSTEM_PROMPT),
        HumanMessage(content=prompt),
    ])

    return {
        "messages": [response],
        "llm_calls": bump_llm_calls(state),
    }
