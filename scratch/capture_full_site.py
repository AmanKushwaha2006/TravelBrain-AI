import subprocess
import time
import os
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

PORT = 8089
ROOT_DIR = Path(r"c:\Users\Lenovo\Desktop\TravelBrain-Multi-Agent-AI-Travel-Planner\dist")

class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)
    def log_message(self, format, *args):
        pass

server = HTTPServer(('127.0.0.1', PORT), QuietHandler)
thread = threading.Thread(target=server.serve_forever)
thread.daemon = True
thread.start()
print(f"Local test server started on http://127.0.0.1:{PORT}")

chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
artifact_dir = Path(r"C:\Users\Lenovo\.gemini\antigravity\brain\41c488b1-ad37-4461-bccc-520aa8d4c7c8")

# Views to capture
views = [
    ("editorial_final_hero.png", f"http://127.0.0.1:{PORT}/#hero"),
    ("editorial_final_journeys.png", f"http://127.0.0.1:{PORT}/#journeys"),
    ("editorial_final_workflow.png", f"http://127.0.0.1:{PORT}/#how-it-works"),
    ("editorial_final_cabins.png", f"http://127.0.0.1:{PORT}/#features"),
]

for filename, url in views:
    out_path = artifact_dir / filename
    cmd = [
        chrome_exe,
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--window-size=1440,900",
        "--virtual-time-budget=2500",
        f"--screenshot={str(out_path)}",
        url
    ]
    print(f"Capturing {filename} from {url}...")
    subprocess.run(cmd, capture_output=True, text=True)
    if out_path.exists():
        print(f"Captured {filename}: {out_path.stat().st_size} bytes")
    else:
        print(f"Failed to capture {filename}")

server.shutdown()
print("All captures complete.")
