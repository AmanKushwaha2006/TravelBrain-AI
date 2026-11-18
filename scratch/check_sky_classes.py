with open('dist/test_fusion_render.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.findall(r'(\.sky-background\s*\{[^}]+\})', c)
for m in matches:
    print(m)

# Find where sky-background is in HTML
pos = c.find('sky-background')
print('HTML snippet:', c[pos-50:pos+300])
