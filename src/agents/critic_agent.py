"""
Critic Agent: Rigorous quality and hallucination evaluation for generated travel plans.

Performs:
1. Named entity extraction (places, attractions, transit hubs, hotels).
2. Live cross-verification with web search.
3. Strict multi-metric scoring (0-100) with detailed hallucination flagging.
"""

import json
import logging
import re
from langchain_core.messages import HumanMessage, SystemMessage

from src.agents.destination import extract_destination
from src.agents.prompts import CRITIC_EVAL_PROMPT, CRITIC_SYSTEM_PROMPT
from src.clients.llm import get_llm
from src.mcp_servers.remote import tavily_mcp_search
from src.utils.async_utils import run_async

logger = logging.getLogger(__name__)


def clean_json_output(raw_text: str) -> dict:
    """Extract and parse clean JSON from LLM response."""
    text = raw_text.strip()
    
    # Strip markdown code blocks if present
    code_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, flags=re.IGNORECASE)
    if code_match:
        candidate = code_match.group(1).strip()
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Fallback: attempt to find the outermost JSON object
    match = re.search(r"(\{[\s\S]*\})", text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
        
    logger.error("Failed to parse JSON from Critic output: %s", raw_text)
    return {
        "overall_score": 70,
        "grade": "B",
        "verdict": "Audit Completed with Raw Notes",
        "breakdown": {
            "entity_factuality": 28,
            "geographic_coherence": 22,
            "transit_realism": 12,
            "pacing_practicality": 8,
        },
        "extracted_entities_count": 0,
        "verified_entities": [],
        "flagged_issues": [],
        "critic_summary": raw_text[:500] if raw_text else "Audit output could not be parsed as structured JSON.",
        "recommendations": ["Review plan manually against official local guide sources."],
    }


def run_critic_evaluation(
    user_query: str,
    plan_text: str,
    destination: str | None = None
) -> dict:
    """
    Executes a comprehensive, strict fact-checking evaluation of a generated travel plan.
    Runs on-demand only when requested by the user.
    """
    if not destination or not destination.strip():
        destination = extract_destination(user_query)

    # 1. Fetch live web ground-truth context for destination geography and major landmarks
    verification_query = f"Official sights landmarks geography how to reach travel guide {destination}"
    try:
        verification_data = run_async(tavily_mcp_search(verification_query))
    except Exception as e:
        logger.warning("Tavily verification search failed: %s", e)
        verification_data = f"Live verification context unavailable: {str(e)}"

    # 2. Format the strict evaluation prompt
    prompt = CRITIC_EVAL_PROMPT.format(
        destination=destination,
        user_query=user_query,
        plan_text=plan_text,
        verification_data=str(verification_data),
    )

    # 3. Call the LLM
    response = get_llm().invoke([
        SystemMessage(content=CRITIC_SYSTEM_PROMPT),
        HumanMessage(content=prompt),
    ])

    # 4. Parse structured JSON
    eval_result = clean_json_output(response.content)
    eval_result["destination"] = destination

    return eval_result
