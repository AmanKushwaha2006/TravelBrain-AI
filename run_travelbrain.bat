@echo off
title TravelBrain AI Server
echo ========================================================
echo   Starting TravelBrain Multi-Agent AI Travel Planner...
echo ========================================================
echo.
cd /d "%~dp0"

echo Opening browser at http://127.0.0.1:8000 ...
start http://127.0.0.1:8000

echo Starting Python server via uv...
uv run python app.py
pause
