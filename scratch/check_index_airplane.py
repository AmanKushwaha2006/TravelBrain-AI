with open('frontend/templates/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
print('jet in index.html:', 'jet' in c)
for m in re.finditer(r'<img[^>]+>', c):
    print('img:', m.group(0))
for m in re.finditer(r'<svg[^>]+>', c):
    tag = m.group(0)
    if any(k in tag.lower() for k in ['plane', 'aero', 'jet', 'flight']):
        print('plane svg:', tag)
