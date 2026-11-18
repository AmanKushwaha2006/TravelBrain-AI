import subprocess
import os

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data = os.path.abspath("tmp_chrome_data")
artifact_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\41c488b1-ad37-4461-bccc-520aa8d4c7c8"

base_html = open("dist/test_fusion_render.html", encoding="utf-8").read()
target_html = base_html.replace(
    "</body>",
    "<script>window.scrollTo(0, 950); window.dispatchEvent(new Event('scroll'));</script></body>"
)
open("dist/temp_journeys.html", "w", encoding="utf-8").write(target_html)

shot = os.path.join(artifact_dir, "verified_luxury_journeys.png")
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
    "file:///" + os.path.abspath("dist/temp_journeys.html").replace("\\", "/")
]
subprocess.run(cmd, timeout=20)
if os.path.exists(shot):
    print("Captured verified_luxury_journeys.png:", os.path.getsize(shot))
