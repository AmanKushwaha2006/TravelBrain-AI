import subprocess
import os
from pathlib import Path

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data = os.path.abspath("tmp_chrome_data")
artifact_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\41c488b1-ad37-4461-bccc-520aa8d4c7c8"

scenes = [
    ("hero", "editorial_scene_hero.png", 0),
    ("journeys", "editorial_scene_journeys.png", 850),
    ("how-it-works", "editorial_scene_workflow.png", 1750),
    ("features", "editorial_scene_cabins.png", 2600),
    ("contact", "editorial_scene_contact.png", 3400)
]

# Read base HTML and generate temporary HTML files that scroll to the specific offset on load
base_html = Path("dist/test_fusion_render.html").read_text(encoding="utf-8")

for sec_id, filename, scroll_y in scenes:
    target_html = base_html.replace(
        "</body>",
        f"""
        <script>
          window.scrollTo(0, {scroll_y});
          window.dispatchEvent(new Event('scroll'));
        </script>
        </body>
        """
    )
    temp_file = Path(f"dist/temp_scene_{sec_id}.html")
    temp_file.write_text(target_html, encoding="utf-8")
    
    html_url = "file:///" + os.path.abspath(str(temp_file)).replace("\\", "/")
    shot = os.path.join(artifact_dir, filename)
    
    cmd = [
        chrome,
        f"--user-data-dir={user_data}",
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--allow-file-access-from-files",
        "--virtual-time-budget=1800",
        "--window-size=1400,900",
        f"--screenshot={shot}",
        html_url
    ]
    print(f"Capturing scene {sec_id} at scroll {scroll_y}px...")
    subprocess.run(cmd, timeout=20)
    if os.path.exists(shot):
        print(f"Captured {filename}: {os.path.getsize(shot)} bytes")
    
    # clean up temp file
    try:
        temp_file.unlink()
    except Exception:
        pass

print("All scenes captured successfully.")
