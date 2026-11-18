with open('frontend/static/js/aviation-3d.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
methods = re.findall(r'(\w+):\s*function', c)
print('Methods in aviation-3d.js:', methods)
