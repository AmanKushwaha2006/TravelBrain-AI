import os
import re
from contextlib import asynccontextmanager
from pathlib import Path
import traceback
import uvicorn

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from src.api.sessions import (
    SESSION_COOKIE,
    SESSION_TTL_SECONDS,
    clear_credentials,
    get_credentials_for,
    new_session_id,
    store_credentials,
)
from src.api.validation import check_database_url, check_groq_api_key
from src.clients import cache
from src.clients.checkpointer import get_pool
from src.config.session import (
    MissingCredentialsError,
    credential_status,
    use_credentials,
)
from src.config.settings import (
    COOKIE_SAMESITE,
    COOKIE_SECURE,
    CORS_ORIGINS,
    DATABASE_URL,
    normalize_database_url,
)
from src.db.models import init_auth_tables
from src.db.auth import (
    create_user,
    authenticate_user,
    create_session,
    get_session_user,
    delete_session,
    cleanup_expired_sessions,
)
from src.db.history import (
    save_trip,
    get_user_history,
    get_trip,
    delete_trip,
)
from src.graph.runner import run_travel_agent

# This is to allow nested event loops for async calls in FastAPI
import nest_asyncio
nest_asyncio.apply()

# --------------- Auth constants ---------------
AUTH_COOKIE = "travelbrain_auth"
AUTH_SESSION_MAX_AGE = 72 * 3600  # 72 hours


BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"


# --------------- Auth DB pool (uses .env DATABASE_URL directly) ---------------
_auth_pool = None


def _get_auth_pool():
    """Lazily create the auth pool from the .env DATABASE_URL."""
    global _auth_pool
    if _auth_pool is None and DATABASE_URL:
        _auth_pool = get_pool(normalize_database_url(DATABASE_URL))
    return _auth_pool


def _get_current_user(request: Request) -> dict | None:
    """Read travelbrain_auth cookie -> resolve user or None."""
    token = request.cookies.get(AUTH_COOKIE)
    if not token:
        return None
    pool = _get_auth_pool()
    if not pool:
        return None
    return get_session_user(pool, token)


# --------------- Lifespan (startup + shutdown) ---------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create auth tables
    pool = _get_auth_pool()
    if pool:
        try:
            init_auth_tables(pool)
            cleanup_expired_sessions(pool)
        except Exception as e:
            print(f"[auth] Table init warning: {e}")
    yield


app = FastAPI(
    title="TravelBrain AI",
    description="LangGraph Multi-Agent Travel Planner with FastAPI Frontend",
    version="1.0.0",
    lifespan=lifespan,
)


# Only needed when the browser talks to this API on a different origin. With
# the Vercel rewrite the frontend is same-origin, so this stays inactive.
if CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type"],
    )


@app.middleware("http")
async def add_no_cache_for_dev(request: Request, call_next):
    """Prevent aggressive browser caching for static files and templates."""
    response = await call_next(request)
    if request.url.path.startswith("/static/") or request.url.path == "/" or request.url.path == "/index.html":
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response


app.mount(
    "/static",
    StaticFiles(directory=str(FRONTEND_DIR / "static")),
    name="static"
)


templates = Jinja2Templates(
    directory=str(FRONTEND_DIR / "templates")
)



from src.agents.critic_agent import run_critic_evaluation

class TravelRequest(BaseModel):
    message: str
    thread_id: str | None = None


class EvaluateRequest(BaseModel):
    query: str
    plan_text: str
    destination: str | None = None
    flight_results: str | None = ""
    hotel_results: str | None = ""
    weather_results: str | None = ""
    itinerary: str | None = ""
    attractions_data: str | None = ""


class ConfigRequest(BaseModel):
    """
    None leaves a field untouched, "" clears it. Keys are held in server
    memory for this session only and are never echoed back.
    """

    groq_api_key: str | None = None
    database_url: str | None = None


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    email: str
    password: str



def _session_id(request: Request) -> str | None:
    return request.cookies.get(SESSION_COOKIE)


def _set_session_cookie(response: Response, session_id: str) -> None:
    response.set_cookie(
        SESSION_COOKIE,
        session_id,
        max_age=SESSION_TTL_SECONDS,
        httponly=True,
        samesite=COOKIE_SAMESITE,
        secure=COOKIE_SECURE,
    )



@app.get("/", response_class=HTMLResponse)
@app.get("/how-it-works", response_class=HTMLResponse)
@app.get("/features", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={}
    )


# =========================
# Credentials
# =========================

@app.get("/api/config")
async def read_config(request: Request):
    """What is configured, and where it came from. Never returns a secret."""

    credentials = get_credentials_for(_session_id(request))

    with use_credentials(credentials):
        return JSONResponse(content=credential_status())


@app.post("/api/config")
async def write_config(request: Request, body: ConfigRequest):
    """
    Store credentials for this browser session. Each supplied value is
    checked against the real service before being accepted.
    """

    session_id = _session_id(request) or new_session_id()

    errors = {}

    groq_key = (body.groq_api_key or "").strip()
    if groq_key:
        ok, detail = check_groq_api_key(groq_key)
        if not ok:
            errors["groq_api_key"] = detail

    database_url = (body.database_url or "").strip()
    if database_url:
        ok, detail = check_database_url(database_url)
        if not ok:
            errors["database_url"] = detail

    if errors:
        response = JSONResponse(
            status_code=400,
            content={"success": False, "errors": errors},
        )
        _set_session_cookie(response, session_id)
        return response

    credentials = store_credentials(
        session_id,
        groq_api_key=body.groq_api_key,
        database_url=body.database_url,
    )

    with use_credentials(credentials):
        payload = {"success": True, **credential_status()}

    response = JSONResponse(content=payload)
    _set_session_cookie(response, session_id)

    return response


@app.delete("/api/config")
async def reset_config(request: Request):
    """Drop session keys and fall back to whatever the server's .env has."""

    clear_credentials(_session_id(request))

    with use_credentials(None):
        return JSONResponse(content={"success": True, **credential_status()})


# =========================
# Planning
# =========================

@app.post("/api/travel")
async def travel_planner(request: Request, request_data: TravelRequest):
    credentials = get_credentials_for(_session_id(request))

    try:
        user_message = request_data.message.strip()

        if not user_message:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Message cannot be empty."
                }
            )

        with use_credentials(credentials):
            result = run_travel_agent(
                user_input=user_message,
                thread_id=request_data.thread_id
            )

        # --- Save to history if user is authenticated ---
        history_id = None
        user = _get_current_user(request)
        if user:
            try:
                pool = _get_auth_pool()
                if pool:
                    # Extract a short title from the query
                    title = _extract_title(user_message)
                    destination = _extract_destination(user_message)
                    trip = save_trip(
                        pool,
                        user_id=user["id"],
                        title=title,
                        query=user_message,
                        destination=destination,
                        result={
                            "answer": result.get("answer", ""),
                            "flight_results": result.get("flight_results", ""),
                            "hotel_results": result.get("hotel_results", ""),
                            "weather_results": result.get("weather_results", ""),
                            "attractions_data": result.get("attractions_data", ""),
                            "itinerary": result.get("itinerary", ""),
                        },
                    )
                    history_id = trip["id"]
            except Exception as ex:
                print(f"[history] Save warning: {ex}")

        return JSONResponse(
            content={
                "success": True,
                "thread_id": result.get("thread_id", ""),
                "answer": result.get("answer", ""),
                "flight_results": result.get("flight_results", ""),
                "hotel_results": result.get("hotel_results", ""),
                "weather_results": result.get("weather_results", ""),
                "attractions_data": result.get("attractions_data", ""),
                "itinerary": result.get("itinerary", ""),
                "llm_calls": result.get("llm_calls", 0),
                "history_id": history_id,
            }
        )

    except MissingCredentialsError as e:
        # The frontend turns this into a prompt to open Settings.
        return JSONResponse(
            status_code=428,
            content={
                "success": False,
                "error": str(e),
                "missing": e.missing,
            }
        )

    except Exception as e:
        print("ERROR:", e)
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )


@app.post("/api/evaluate")
async def evaluate_plan(request: Request, body: EvaluateRequest):
    credentials = get_credentials_for(_session_id(request))

    try:
        plan_content = body.plan_text.strip()
        if not plan_content:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Plan text cannot be empty for evaluation."
                }
            )

        with use_credentials(credentials):
            eval_data = run_critic_evaluation(
                user_query=body.query.strip(),
                plan_text=plan_content,
                destination=body.destination,
                flight_results=body.flight_results or "",
                hotel_results=body.hotel_results or "",
                weather_results=body.weather_results or "",
                itinerary=body.itinerary or "",
                attractions_data=body.attractions_data or "",
            )

        return JSONResponse(
            content={
                "success": True,
                "evaluation": eval_data,
            }
        )

    except MissingCredentialsError as e:
        return JSONResponse(
            status_code=428,
            content={
                "success": False,
                "error": str(e),
                "missing": e.missing,
            }
        )
    except Exception as e:
        print("CRITIC ERROR:", e)
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )



# =========================
# Helper: extract title/destination from query
# =========================

def _extract_title(query: str) -> str:
    """Build a short sidebar-friendly title from the user query."""
    q = query.strip()
    # Try "trip to <dest>"
    m = re.search(r'trip\s+to\s+(.+?)(?:\s+from|\s*\.|\s*,|$)', q, re.IGNORECASE)
    if m:
        dest = m.group(1).strip()[:60]
        return f"Trip to {dest}"
    # Fallback: first 50 chars
    return q[:50] + ("…" if len(q) > 50 else "")


def _extract_destination(query: str) -> str:
    """Try to pull destination city from the query."""
    m = re.search(r'trip\s+to\s+([A-Za-z\s]+?)(?:\s+from|\s*\.|\s*,|\s+for|$)', query, re.IGNORECASE)
    if m:
        return m.group(1).strip()[:100]
    return ""


# =========================
# Authentication Endpoints
# =========================

def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        AUTH_COOKIE,
        token,
        max_age=AUTH_SESSION_MAX_AGE,
        httponly=True,
        samesite=COOKIE_SAMESITE,
        secure=COOKIE_SECURE,
    )


def _clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(AUTH_COOKIE, samesite=COOKIE_SAMESITE, secure=COOKIE_SECURE)


@app.post("/api/auth/signup")
async def signup(request: Request, body: SignupRequest):
    pool = _get_auth_pool()
    if not pool:
        return JSONResponse(status_code=503, content={"success": False, "error": "Database not configured."})

    # Validation
    errors = {}
    name = body.name.strip()
    email = body.email.strip().lower()
    password = body.password
    confirm = body.confirm_password

    if not name:
        errors["name"] = "Name is required."
    if not email or not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        errors["email"] = "Please enter a valid email address."
    if len(password) < 6:
        errors["password"] = "Password must be at least 6 characters."
    if password != confirm:
        errors["confirm_password"] = "Passwords do not match."

    if errors:
        return JSONResponse(status_code=400, content={"success": False, "errors": errors})

    try:
        user = create_user(pool, name=name, email=email, password=password)
    except ValueError as e:
        return JSONResponse(status_code=409, content={"success": False, "errors": {"email": str(e)}})

    token = create_session(pool, user["id"])
    response = JSONResponse(content={"success": True, "user": user})
    _set_auth_cookie(response, token)
    return response


@app.post("/api/auth/login")
async def login(request: Request, body: LoginRequest):
    pool = _get_auth_pool()
    if not pool:
        return JSONResponse(status_code=503, content={"success": False, "error": "Database not configured."})

    email = body.email.strip().lower()
    password = body.password

    if not email or not password:
        return JSONResponse(status_code=400, content={"success": False, "error": "Email and password are required."})

    user = authenticate_user(pool, email=email, password=password)
    if not user:
        return JSONResponse(status_code=401, content={"success": False, "error": "Invalid email or password."})

    token = create_session(pool, user["id"])
    response = JSONResponse(content={"success": True, "user": user})
    _set_auth_cookie(response, token)
    return response


@app.post("/api/auth/logout")
async def logout(request: Request):
    token = request.cookies.get(AUTH_COOKIE)
    pool = _get_auth_pool()
    if token and pool:
        try:
            delete_session(pool, token)
        except Exception:
            pass

    response = JSONResponse(content={"success": True})
    _clear_auth_cookie(response)
    return response


@app.get("/api/auth/me")
async def auth_me(request: Request):
    user = _get_current_user(request)
    if not user:
        return JSONResponse(status_code=401, content={"authenticated": False})
    return JSONResponse(content={"authenticated": True, "user": user})


# =========================
# Travel History Endpoints
# =========================

@app.get("/api/history")
async def list_history(request: Request):
    user = _get_current_user(request)
    if not user:
        return JSONResponse(status_code=401, content={"success": False, "error": "Not authenticated."})

    pool = _get_auth_pool()
    trips = get_user_history(pool, user["id"])
    return JSONResponse(content={"success": True, "trips": trips})


@app.get("/api/history/{trip_id}")
async def read_history(request: Request, trip_id: str):
    user = _get_current_user(request)
    if not user:
        return JSONResponse(status_code=401, content={"success": False, "error": "Not authenticated."})

    pool = _get_auth_pool()
    trip = get_trip(pool, user["id"], trip_id)
    if not trip:
        return JSONResponse(status_code=404, content={"success": False, "error": "Trip not found."})

    return JSONResponse(content={"success": True, "trip": trip})


@app.delete("/api/history/{trip_id}")
async def remove_history(request: Request, trip_id: str):
    user = _get_current_user(request)
    if not user:
        return JSONResponse(status_code=401, content={"success": False, "error": "Not authenticated."})

    pool = _get_auth_pool()
    deleted = delete_trip(pool, user["id"], trip_id)
    if not deleted:
        return JSONResponse(status_code=404, content={"success": False, "error": "Trip not found."})

    return JSONResponse(content={"success": True})


@app.head("/", include_in_schema=False)
async def home_head():
    """Hosting platforms probe with HEAD to detect an open port."""

    return Response(status_code=200)


@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check(request: Request):
    credentials = get_credentials_for(_session_id(request))

    with use_credentials(credentials):
        status = credential_status()

    return {
        "status": "ok",
        "message": "AI Travel Planner API is running",
        "ready": status["ready"],
        "missing": status["missing"],
        "cache": cache.status(),
    }


@app.get("/favicon.ico")
async def favicon():
    return JSONResponse(content={})



if __name__ == "__main__":
    # Defaults suit local development. In Docker, HOST is set to 0.0.0.0
    # so the port is reachable from outside the container.
    uvicorn.run(
        "app:app",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("RELOAD", "true").lower() not in ("false", "0", "no")
    )
