with open('frontend/static/js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

import re
matches = [m.start() for m in re.finditer(r'collapsePlanBtn', app_js)]
for pos in matches:
    print('collapsePlanBtn at:', pos)
    print(app_js[pos-50:pos+250])

plan_matches = [m.start() for m in re.finditer(r'handlePlanJourney', app_js)]
for pos in plan_matches:
    print('handlePlanJourney at:', pos)
    print(app_js[pos-50:pos+250])
