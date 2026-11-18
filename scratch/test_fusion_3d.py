import subprocess
import os
from pathlib import Path

# Update test_fusion_render to include the 3D canvas and aviation-3d.js
test_html = Path("dist/test_fusion_render.html").read_text(encoding="utf-8")

# Adjust box width for search console
test_html = test_html.replace(
    ".box { width: min(520px, 46vw);",
    ".box { width: min(620px, 54vw);"
)

# Add 3D canvas container directly behind main
test_html = test_html.replace(
    '<div class="grain" aria-hidden="true"></div>',
    '<div class="grain" aria-hidden="true"></div>\n  <div class="aviation-canvas-container" id="heroCanvasContainer"></div>'
)

# Add Three.js, GLTFLoader, and aviation-3d.js scripts before </body>
scripts = """
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="./static/js/GLTFLoader.js"></script>
  <script src="./static/js/aviation-3d.js"></script>
  <script>
    if (window.Aviation3D) {
      window.addEventListener('DOMContentLoaded', function() {
        Aviation3D.init("heroCanvasContainer");
      });
    }
  </script>
</body>
"""
test_html = test_html.replace("</body>", scripts)

Path("dist/test_fusion_3d.html").write_text(test_html, encoding="utf-8")
print("dist/test_fusion_3d.html written successfully!")
