with open('frontend/templates/index.html', 'r', encoding='utf-8') as f:
    orig = f.read()

import re
matches = [m.start() for m in re.finditer(r'chatSidebar', orig)]
for pos in matches:
    print('Found chatSidebar at:', pos)
    print(orig[pos-100:pos+200])
