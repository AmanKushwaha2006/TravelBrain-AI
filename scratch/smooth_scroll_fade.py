with open('frontend/static/js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

old_formula = "var o = clamp(1 - (Math.abs(d) - 0.12) / 0.4);"
new_formula = "var o = rm ? 1 : clamp(1 - (Math.abs(d) - 0.25) / 0.65, 0.2, 1);"

app_js = app_js.replace(old_formula, new_formula)
app_js = app_js.replace("el.style.pointerEvents = o > 0.35 ? 'auto' : 'none';", "el.style.pointerEvents = o > 0.25 ? 'auto' : 'none';")

with open('frontend/static/js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

with open('dist/static/js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

# Also update test_fusion_render.html
with open('dist/test_fusion_render.html', 'r', encoding='utf-8') as f:
    h = f.read()

h = h.replace("const o = clamp(1 - (Math.abs(d) - 0.12) / 0.4);", "const o = clamp(1 - (Math.abs(d) - 0.25) / 0.65, 0.2, 1);")
h = h.replace("el.style.pointerEvents = o > 0.4 ? 'auto' : 'none';", "el.style.pointerEvents = o > 0.25 ? 'auto' : 'none';")

with open('dist/test_fusion_render.html', 'w', encoding='utf-8') as f:
    f.write(h)

print("Updated scroll opacity formula in all files.")
