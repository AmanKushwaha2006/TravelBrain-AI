"""
Liveness checks for credentials entered into the API configuration modal.

All checks are fast and non-destructive:
- Groq: queries /models
- Tavily: queries /search
- AviationStack: queries /airports
- OpenWeather: queries /weather
- PostgreSQL: tests connection and runs SELECT 1
"""

import psycopg
import requests

from src.config.settings import normalize_database_url

GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models"
TAVILY_SEARCH_URL = "https://api.tavily.com/search"
AVIATIONSTACK_AIRPORTS_URL = "https://api.aviationstack.com/v1/airports"
OPENWEATHER_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"


def check_groq_api_key(api_key: str) -> tuple[bool, str]:
    if not api_key or not api_key.strip():
        return False, "Groq API key cannot be empty."
    try:
        response = requests.get(
            GROQ_MODELS_URL,
            headers={"Authorization": f"Bearer {api_key.strip()}"},
            timeout=10,
        )
    except requests.RequestException as error:
        return False, f"Could not reach Groq: {error}"

    if response.status_code == 401:
        return False, "Groq rejected this key (401 Unauthorized)."

    if not response.ok:
        return False, f"Groq returned HTTP {response.status_code}."

    return True, "Connected successfully. Key verified with Groq."


def check_tavily_api_key(api_key: str) -> tuple[bool, str]:
    if not api_key or not api_key.strip():
        return False, "Tavily API key cannot be empty."
    try:
        response = requests.post(
            TAVILY_SEARCH_URL,
            json={"api_key": api_key.strip(), "query": "test", "max_results": 1},
            timeout=10,
        )
    except requests.RequestException as error:
        return False, f"Could not reach Tavily: {error}"

    if response.status_code in (401, 403):
        return False, "Tavily rejected this key (Unauthorized / Invalid key)."

    if not response.ok:
        return False, f"Tavily returned HTTP {response.status_code}."

    return True, "Connected successfully. Key verified with Tavily Search."


def check_aviationstack_api_key(api_key: str) -> tuple[bool, str]:
    if not api_key or not api_key.strip():
        return False, "AviationStack API key cannot be empty."
    try:
        response = requests.get(
            AVIATIONSTACK_AIRPORTS_URL,
            params={"access_key": api_key.strip(), "limit": 1},
            timeout=10,
        )
    except requests.RequestException as error:
        return False, f"Could not reach AviationStack: {error}"

    if response.status_code == 401:
        return False, "AviationStack rejected this key (401 Unauthorized)."

    try:
        data = response.json()
        if isinstance(data, dict) and data.get("error"):
            err_info = data["error"].get("info") or data["error"].get("message") or "Invalid API key"
            return False, f"AviationStack error: {err_info}"
    except Exception:
        pass

    if not response.ok:
        return False, f"AviationStack returned HTTP {response.status_code}."

    return True, "Connected successfully. Key verified with AviationStack."


def check_openweather_api_key(api_key: str) -> tuple[bool, str]:
    if not api_key or not api_key.strip():
        return False, "OpenWeather API key cannot be empty."
    try:
        response = requests.get(
            OPENWEATHER_CURRENT_URL,
            params={"q": "London", "appid": api_key.strip()},
            timeout=10,
        )
    except requests.RequestException as error:
        return False, f"Could not reach OpenWeather: {error}"

    if response.status_code in (401, 403):
        return False, "OpenWeather rejected this key (401 Unauthorized)."

    if not response.ok:
        return False, f"OpenWeather returned HTTP {response.status_code}."

    return True, "Connected successfully. Key verified with OpenWeather."


def check_database_url(database_url: str) -> tuple[bool, str]:
    if not database_url or not database_url.strip():
        return False, "Database URL cannot be empty."
    try:
        connection = psycopg.connect(
            normalize_database_url(database_url.strip()),
            connect_timeout=8,
        )
    except Exception as error:
        return False, f"Could not connect to database: {error}"

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as error:
        return False, f"Connected, but the test query failed: {error}"
    finally:
        connection.close()

    return True, "Connected successfully. Database query passed."
