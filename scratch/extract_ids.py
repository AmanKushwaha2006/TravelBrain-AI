import re

text = open('frontend/templates/index.html', encoding='utf-8').read()
ids = re.findall(r'id=["\']([^"\']+)["\']', text)
print(f"Total IDs: {len(ids)}")
print(", ".join(ids))
