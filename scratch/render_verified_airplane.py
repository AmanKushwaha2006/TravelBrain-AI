import subprocess
import os
from pathlib import Path

# Create dist/test_fusion_3d.html
test_html = Path("dist/test_fusion_render.html").read_text(encoding="utf-8")

# Ensure canvas container is present
if 'id="heroCanvasContainer"' not in test_html:
    test_html = test_html.replace(
        '<div class="grain" aria-hidden="true"></div>',
        '<div class="grain" aria-hidden="true"></div>\n  <div class="aviation-canvas-container" id="heroCanvasContainer" style="position:fixed;inset:0;width:100vw;height:100vh;z-index:1;pointer-events:none;"></div>'
    )

# Add Three.js, GLTFLoader, and aviation-3d.js
scripts = """
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="./static/js/GLTFLoader.js"></script>
  <script src="./static/js/aviation-3d.js?v=test"></script>
  <script>
    window.addEventListener('DOMContentLoaded', function() {
      if (window.Aviation3D) {
        Aviation3D.init("heroCanvasContainer");
      }
    });
  </script>
</body>
"""

if 'Aviation3D.init' not in test_html:
    test_html = test_html.replace("</body>", scripts)

Path("dist/test_fusion_3d.html").write_text(test_html, encoding="utf-8")

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data = os.path.abspath("tmp_chrome_data")
artifact_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\41c488b1-ad37-4461-bccc-520aa8d4c7c8"
shot = os.path.join(artifact_dir, "verified_scaled_airplane.png")

cmd = [
    chrome,
    f"--user-data-dir={user_data}",
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--allow-file-access-from-files",
    "--virtual-time-budget=3500",
    "--window-size=1400,900",
    f"--screenshot={shot}",
    "file:///" + os.path.abspath("dist/test_fusion_3d.html").replace("\\", "/")
]

print("Rendering verified_scaled_airplane.png...")
subprocess.run(cmd, timeout=25)

if os.path.exists(shot):
    print("Screenshot captured successfully! Size:", os.path.getsize(shot))
else:
    print("Failed to capture screenshot.")
