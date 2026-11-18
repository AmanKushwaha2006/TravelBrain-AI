import subprocess
import os

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data = os.path.abspath("tmp_chrome_data")
artifact_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\41c488b1-ad37-4461-bccc-520aa8d4c7c8"

scenes = [
    ("journeys", 900),
    ("how-it-works", 1800),
    ("features", 2700),
    ("contact", 3500)
]

base_html = open("dist/test_fusion_render.html", encoding="utf-8").read()

for sec_id, y in scenes:
    target_html = base_html.replace(
        "</body>",
        f"""
        <script>
          window.addEventListener('load', () => {{
            setTimeout(() => {{
              window.scrollTo({{ top: {y}, behavior: 'instant' }});
            }}, 100);
          }});
        </script>
        </body>
        """
    )
    temp_path = f"dist/temp_shot_{sec_id}.html"
    open(temp_path, "w", encoding="utf-8").write(target_html)
    
    shot = os.path.join(artifact_dir, f"verified_editorial_{sec_id}.png")
    cmd = [
        chrome,
        f"--user-data-dir={user_data}",
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--allow-file-access-from-files",
        "--virtual-time-budget=2500",
        "--window-size=1400,900",
        f"--screenshot={shot}",
        "file:///" + os.path.abspath(temp_path).replace("\\", "/")
    ]
    subprocess.run(cmd, timeout=20)
    if os.path.exists(shot):
        print(f"Captured {sec_id}: {os.path.getsize(shot)} bytes")
    
    try:
        os.remove(temp_path)
    except Exception:
        pass

print("All screenshots generated.")
