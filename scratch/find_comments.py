with open('frontend/templates/index.html', 'r', encoding='utf-8') as f:
    orig = f.read()

import re
matches = re.findall(r'<!--\s*={5,}[^>]+={5,}\s*-->', orig)
for m in matches:
    print(m)
