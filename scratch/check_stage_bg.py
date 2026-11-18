with open('dist/test_fusion_render.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.findall(r'(\.stage\s*\{[^}]+\})', c)
for m in matches:
    print(m)

sky_matches = re.findall(r'(sky[^\'\"\s]+)', c)
print('Sky matches:', set(sky_matches))
