import re

with open(r'd:\Downloads from chrome\Aether — Above the ordinary.html', 'r', encoding='utf-8') as f:
    c = f.read()

print('=== Sections in Aether ===')
for m in re.finditer(r'<section[^>]*>', c):
    print(m.group(0))

print('\n=== CSS in Aether (keys) ===')
style_match = re.search(r'<style>(.*?)</style>', c, re.DOTALL)
if style_match:
    style_content = style_match.group(1)
    selectors = re.findall(r'([^{]+)\{', style_content)
    for s in selectors[:40]:
        s_clean = s.strip().replace('\n', ' ')
        if s_clean and not s_clean.startswith('@'):
            print(s_clean)
