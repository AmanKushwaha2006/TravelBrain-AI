# -*- coding: utf-8 -*-
import subprocess

# 1. Test Node.js syntax
res = subprocess.run(["node", "-c", "frontend/static/js/itinerary.js"], capture_output=True, text=True)
assert res.returncode == 0, f"JS syntax error: {res.stderr}"
print("JS syntax check passed!")

# 2. Check CSS for blue replacements
with open("frontend/static/css/itinerary.css", "r", encoding="utf-8") as f:
    css = f.read()

assert "auto-fit" in css, "auto-fit not found in CSS"
assert "fallback-card" in css, "fallback-card not found in CSS"
assert "#55B8E8" not in css, "#55B8E8 still present in CSS"
assert "#050B14" not in css, "#050B14 still present in CSS"
assert "#10B981" in css, "#10B981 (Emerald Jade) not found in CSS"
assert "#070B09" in css, "#070B09 (Obsidian) not found in CSS"
print("CSS checks passed!")

# 3. Check HTML
with open("frontend/templates/itinerary.html", "r", encoding="utf-8") as f:
    html = f.read()

assert "#55B8E8" not in html, "#55B8E8 still present in HTML"
assert "#10B981" in html, "#10B981 not present in HTML"
print("HTML checks passed!")

# 4. Check dist files
for fname in ["dist/itinerary.html", "dist/trip-plan.html", "dist/static/css/itinerary.css", "dist/static/js/itinerary.js"]:
    with open(fname, "r", encoding="utf-8") as f:
        content = f.read()
    assert "#55B8E8" not in content, f"#55B8E8 still present in {fname}"
print("Dist checks passed!")

print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
