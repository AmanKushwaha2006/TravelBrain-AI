"""Shared state passed between every node of the travel graph."""

import operator
from typing import Annotated, TypedDict

from langchain_core.messages import AnyMessage


class TravelState(TypedDict, total=False):
    messages: Annotated[list[AnyMessage], operator.add]
    user_query: str
    flight_results: str
    hotel_results: str
    attractions_data: str
    itinerary: str
    llm_calls: int
    weather_results: str
    critic_evaluation: dict | None


def initial_state(user_query: str) -> TravelState:
    """Build the empty state the graph starts from."""

    from langchain_core.messages import HumanMessage

    return {
        "messages": [HumanMessage(content=user_query)],
        "user_query": user_query,
        "flight_results": "",
        "hotel_results": "",
        "attractions_data": "",
        "weather_results": "",
        "itinerary": "",
        "critic_evaluation": None,
        "llm_calls": 0,
    }
