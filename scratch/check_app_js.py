with open('frontend/static/js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

print('Length of app.js:', len(app_js))
for term in ['setScrollProgress', 'aviationHud', 'initAetherScrollEngine', 'initAether', 'hud']:
    print(f'{term}: {term in app_js}')
