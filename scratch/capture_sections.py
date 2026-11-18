import subprocess
import os
from pathlib import Path

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data = os.path.abspath("tmp_chrome_data")
artifact_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\41c488b1-ad37-4461-bccc-520aa8d4c7c8"
html_path = "file:///" + os.path.abspath("dist/test_fusion_render.html").replace("\\", "/")

# We can create a tiny test wrapper that scrolls to each anchor on load
sections = ["hero", "journeys", "how-it-works", "features", "contact"]

for sec in sections:
    shot = os.path.join(artifact_dir, f"verified_section_{sec}.png")
    target_url = f"{html_path}#{sec}"
    cmd = [
        chrome,
        f"--user-data-dir={user_data}",
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--allow-file-access-from-files",
        "--virtual-time-budget=2000",
        "--window-size=1400,900",
        f"--screenshot={shot}",
        target_url
    ]
    print(f"Capturing section #{sec} to {shot}...")
    subprocess.run(cmd, timeout=20)
    if os.path.exists(shot):
        print(f"Captured {sec}: {os.path.getsize(shot)} bytes")
    else:
        print(f"Failed to capture {sec}")

print("Completed capturing all sections.")
