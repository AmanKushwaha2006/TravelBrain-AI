import re

text = open('frontend/static/js/app.js', encoding='utf-8').read()
ids = set(re.findall(r'getElementById\(["\']([^"\']+)["\']\)', text))
qs = set(re.findall(r'querySelector\(["\']([^"\']+)["\']\)', text))
qsa = set(re.findall(r'querySelectorAll\(["\']([^"\']+)["\']\)', text))
print('IDs used in app.js:', len(ids))
print(', '.join(sorted(ids)))
print('\nQuery selectors in app.js:', len(qs))
print(', '.join(sorted(qs)))
print('\nQuery selector all in app.js:', len(qsa))
print(', '.join(sorted(qsa)))
