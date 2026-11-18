import subprocess
import os

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data = os.path.abspath("tmp_chrome_data")
artifact_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\41c488b1-ad37-4461-bccc-520aa8d4c7c8"

# Read base HTML and create test_journeys_view.html where hero is removed, so Journeys is at the top
base_html = open("dist/test_fusion_render.html", encoding="utf-8").read()

# Make all .scene .box visible with full opacity 1 for visual verification
journeys_html = base_html.replace(
    ".box { width: min(640px, 56vw);",
    ".box { width: min(640px, 56vw); opacity: 1 !important; transform: none !important;"
)
# Place journeys first
hero_end = journeys_html.find('</section>\n\n      <!-- Scene 2: Workflow')
journeys_pos = journeys_html.find('<!-- Scene 3: Journeys -->')
if journeys_pos != -1:
    journeys_content = journeys_html[journeys_pos:journeys_html.find('<!-- Scene 4: Features')]
    journeys_view_html = journeys_html.replace(
        '<section class="scene hero" id="hero">',
        f'<section class="scene" id="journeys_top" style="padding-top:120px;">{journeys_content}</section><section class="scene hero" id="hero" style="display:none;">'
    )
    open("dist/test_journeys_top.html", "w", encoding="utf-8").write(journeys_view_html)
    
    shot = os.path.join(artifact_dir, "test_journeys_view_verified.png")
    cmd = [
        chrome,
        f"--user-data-dir={user_data}",
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--allow-file-access-from-files",
        "--window-size=1400,900",
        f"--screenshot={shot}",
        "file:///" + os.path.abspath("dist/test_journeys_top.html").replace("\\", "/")
    ]
    subprocess.run(cmd, timeout=20)
    if os.path.exists(shot):
        print("Captured test_journeys_view_verified.png:", os.path.getsize(shot))
