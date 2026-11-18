with open('app.py', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.findall(r'app\.mount[^\n]+', c)
for m in matches:
    print(m)
