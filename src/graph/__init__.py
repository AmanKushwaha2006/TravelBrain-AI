from src.graph.state import TravelState, initial_state

__all__ = [
    "TravelState",
    "build_graph",
    "get_travel_graph",
    "initial_state",
    "run_travel_agent",
]


def __getattr__(name: str):
    if name in ("build_graph", "get_travel_graph"):
        from src.graph.graph import build_graph, get_travel_graph
        return {"build_graph": build_graph, "get_travel_graph": get_travel_graph}[name]
    if name == "run_travel_agent":
        from src.graph.runner import run_travel_agent
        return run_travel_agent
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
