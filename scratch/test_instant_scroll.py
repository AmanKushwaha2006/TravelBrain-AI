import subprocess
import os

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data = os.path.abspath("tmp_chrome_data")
artifact_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\41c488b1-ad37-4461-bccc-520aa8d4c7c8"

base_html = open("dist/test_fusion_render.html", encoding="utf-8").read()
# disable smooth scroll for testing instant position
target_html = base_html.replace(
    "html{scroll-behavior:smooth;",
    "html{scroll-behavior:auto;"
).replace(
    "scroll-behavior: smooth;",
    "scroll-behavior: auto;"
).replace(
    "</body>",
    """
    <script>
      document.documentElement.scrollTop = 950;
      document.body.scrollTop = 950;
    </script>
    </body>
    """
)
open("dist/temp_instant_journeys.html", "w", encoding="utf-8").write(target_html)

shot = os.path.join(artifact_dir, "test_instant_journeys.png")
cmd = [
    chrome,
    f"--user-data-dir={user_data}",
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--allow-file-access-from-files",
    "--window-size=1400,900",
    f"--screenshot={shot}",
    "file:///" + os.path.abspath("dist/temp_instant_journeys.html").replace("\\", "/")
]
subprocess.run(cmd, timeout=20)
if os.path.exists(shot):
    print("Captured test_instant_journeys.png:", os.path.getsize(shot))
