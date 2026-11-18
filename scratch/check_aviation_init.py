with open('frontend/static/js/aviation-3d.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.findall(r'getElementById\([\'"][^\'"]+[\'"]\)', c)
print('DOM lookups in aviation-3d.js:', set(matches))

init_pos = c.find('init:')
print('Init method:', c[init_pos:init_pos+400])
