with open('frontend/static/js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

import re
matches = [m.start() for m in re.finditer(r'btnPlanJourney\.addEventListener', app_js)]
for pos in matches:
    print('btnPlanJourney click at:', pos)
    print(app_js[pos-50:pos+350])
