import re

# Load list of all required IDs from scratch/extracted_ids.txt or extract from original
with open('frontend/templates/index.html', 'r', encoding='utf-8') as f:
    orig_html = f.read()

orig_ids = set(re.findall(r'id=["\']([^"\']+)["\']', orig_html))
print(f'Total unique IDs in original index.html: {len(orig_ids)}')

# Write out the list of IDs so we can compare
with open('scratch/orig_ids.txt', 'w', encoding='utf-8') as f:
    for i in sorted(orig_ids):
        f.write(i + '\n')
