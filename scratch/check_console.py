import subprocess
import os

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data = os.path.abspath("tmp_chrome_data")
url = "file:///" + os.path.abspath("dist/test_fusion_3d.html").replace("\\", "/")

cmd = [
    chrome,
    f"--user-data-dir={user_data}",
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--allow-file-access-from-files",
    "--enable-logging=stderr",
    "--v=1",
    "--virtual-time-budget=4000",
    url
]

res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
print("STDOUT:", res.stdout[:500])
print("STDERR:", res.stderr[:1000])
