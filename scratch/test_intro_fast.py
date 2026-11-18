import subprocess
import os

test_html = open("dist/test_fusion_3d.html", encoding="utf-8").read()

# Force introTimer to already be finished in Aviation3D
test_html = test_html.replace(
    'Aviation3D.init("heroCanvasContainer");',
    'Aviation3D.init("heroCanvasContainer"); Aviation3D.introTimer = 3.0;'
)
open("dist/test_fast_intro.html", "w", encoding="utf-8").write(test_html)

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data = os.path.abspath("tmp_chrome_data")
artifact_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\41c488b1-ad37-4461-bccc-520aa8d4c7c8"
shot = os.path.join(artifact_dir, "test_airplane_visible.png")

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
    "file:///" + os.path.abspath("dist/test_fast_intro.html").replace("\\", "/")
]

subprocess.run(cmd, timeout=20)
if os.path.exists(shot):
    print("Captured test_airplane_visible.png:", os.path.getsize(shot))
