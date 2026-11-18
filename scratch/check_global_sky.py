with open('frontend/static/css/styles.css', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.findall(r'(\.global-sky[^{]+\{[^}]+\})', c)
for m in matches:
    print(m)
