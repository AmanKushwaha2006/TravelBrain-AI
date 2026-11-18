with open('dist/test_fusion_render.html', 'r', encoding='utf-8') as f:
    h = f.read()

import re
h = re.sub(r'\.box\s*\{[^}]+\}', '.box { width: min(640px, 56vw); will-change: transform, opacity; text-shadow: 0 4px 30px rgba(7,22,35,.25); }', h)
h = h.replace('Plan My Jou', 'Plan Journey')
h = h.replace('button class="btn btn-primary btn-plan-journey"', 'button class="btn btn-primary btn-plan-journey" style="white-space:nowrap; padding: 12px 22px;"')

with open('dist/test_fusion_render.html', 'w', encoding='utf-8') as f:
    f.write(h)

print("Updated test_fusion_render.html")
