with open('frontend/static/js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

import re
matches = [m.start() for m in re.finditer(r'planningSection\.hidden\s*=', app_js)]
for pos in matches:
    print('planningSection.hidden at:', pos)
    print(app_js[pos-50:pos+250])
