with open('frontend/static/js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

pos = app_js.find('function planJourney()')
print(app_js[pos:pos+500])
