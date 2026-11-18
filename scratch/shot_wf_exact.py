import subprocess
import os

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data = os.path.abspath("tmp_chrome_data")
artifact_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\41c488b1-ad37-4461-bccc-520aa8d4c7c8"

base_html = open("dist/test_fusion_render.html", encoding="utf-8").read()

visible_html = base_html.replace(
    ".box { width: min(640px, 56vw);",
    ".box { width: min(960px, 86vw); opacity: 1 !important; transform: none !important;"
)

wf_pos = visible_html.find('<!-- Scene 2: How It Works -->')
wf_end = visible_html.find('<!-- Scene 3: Journeys -->')
wf_content = visible_html[wf_pos:wf_end]

wf_html = visible_html.replace(
    '<section class="scene hero" id="hero">',
    f'<section class="scene" id="wf_top" style="padding-top:100px;">{wf_content}</section><section class="scene hero" id="hero" style="display:none;">'
)
open("dist/test_wf_top.html", "w", encoding="utf-8").write(wf_html)

shot_wf = os.path.join(artifact_dir, "test_workflow_view_verified.png")
cmd = [
    chrome,
    f"--user-data-dir={user_data}",
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--allow-file-access-from-files",
    "--window-size=1400,900",
    f"--screenshot={shot_wf}",
    "file:///" + os.path.abspath("dist/test_wf_top.html").replace("\\", "/")
]
subprocess.run(cmd, timeout=20)
if os.path.exists(shot_wf):
    print("Captured test_workflow_view_verified.png:", os.path.getsize(shot_wf))
