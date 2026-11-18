with open('frontend/static/js/aviation-3d.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = [m.start() for m in re.finditer(r'scrollProgress', c)]
for pos in matches:
    print('scrollProgress at:', pos)
    print(c[pos-50:pos+300])
