__all__ = [
    "critic_agent",
    "extract_destination",
    "final_agent",
    "flight_agent",
    "hotel_agent",
    "itinerary_agent",
    "weather_agent",
    "run_critic_evaluation",
]


def __getattr__(name: str):
    if name == "critic_agent":
        from src.agents.critic_agent import critic_agent
        return critic_agent
    if name == "extract_destination":
        from src.agents.destination import extract_destination
        return extract_destination
    if name == "final_agent":
        from src.agents.final_agent import final_agent
        return final_agent
    if name == "flight_agent":
        from src.agents.flight_agent import flight_agent
        return flight_agent
    if name == "hotel_agent":
        from src.agents.hotel_agent import hotel_agent
        return hotel_agent
    if name == "itinerary_agent":
        from src.agents.itinerary_agent import itinerary_agent
        return itinerary_agent
    if name == "weather_agent":
        from src.agents.weather_agent import weather_agent
        return weather_agent
    if name == "run_critic_evaluation":
        from src.agents.critic_agent import run_critic_evaluation
        return run_critic_evaluation
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
