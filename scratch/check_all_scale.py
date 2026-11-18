with open('frontend/static/js/aviation-3d.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = [m.start() for m in re.finditer(r'scale', c)]
for pos in matches:
    print('pos:', pos)
    print(c[pos-30:pos+100])
