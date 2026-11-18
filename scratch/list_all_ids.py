with open('frontend/templates/index.html', 'r', encoding='utf-8') as f:
    orig = f.read()

import re
matches = re.findall(r'<[^>]+id=["\']([^"\']+)["\'][^>]*>', orig)
print("All IDs in index.html:")
for i, m in enumerate(matches):
    print(f"{i+1}: {m}")
