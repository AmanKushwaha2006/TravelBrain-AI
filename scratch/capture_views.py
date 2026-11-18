import subprocess
import os
from pathlib import Path

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data = os.path.abspath("tmp_chrome_data")
artifact_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\41c488b1-ad37-4461-bccc-520aa8d4c7c8"
html_path = "file:///" + os.path.abspath("dist/test_fusion_render.html").replace("\\", "/")

views = [
    ("editorial_fusion_hero.png", 1400, 900),
    ("editorial_fusion_full.png", 1400, 3200)
]

for filename, w, h in views:
    shot = os.path.join(artifact_dir, filename)
    cmd = [
        chrome,
        f"--user-data-dir={user_data}",
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--allow-file-access-from-files",
        f"--window-size={w},{h}",
        f"--screenshot={shot}",
        html_path
    ]
    print(f"Capturing {filename}...")
    subprocess.run(cmd, timeout=20)
    if os.path.exists(shot):
        print(f"Captured {filename}: {os.path.getsize(shot)} bytes")
    else:
        print(f"Failed to capture {filename}")

print("Done.")
