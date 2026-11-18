with open('frontend/static/js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

pos = app_js.find('quick-pill')
print(app_js[pos-50:pos+500])
