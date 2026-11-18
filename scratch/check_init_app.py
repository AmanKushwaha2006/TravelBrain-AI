with open('frontend/static/js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# Let's inspect where initialization happens
init_idx = app_js.find('/* ---------------- Initialization ---------------- */')
print(app_js[init_idx:])
