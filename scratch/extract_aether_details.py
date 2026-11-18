import re

with open(r'd:\Downloads from chrome\Aether — Above the ordinary.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Extract full style
style_match = re.search(r'<style>(.*?)</style>', c, re.DOTALL)
if style_match:
    with open('scratch/aether_style.css', 'w', encoding='utf-8') as out:
        out.write(style_match.group(1))
    print('Wrote scratch/aether_style.css')

# Extract all script content
scripts = re.findall(r'<script>(.*?)</script>', c, re.DOTALL)
for i, s in enumerate(scripts):
    with open(f'scratch/aether_script_{i}.js', 'w', encoding='utf-8') as out:
        out.write(s)
    print(f'Wrote scratch/aether_script_{i}.js')

# Extract body content (without scripts)
body_match = re.search(r'<body>(.*?)<script', c, re.DOTALL)
if body_match:
    with open('scratch/aether_body.html', 'w', encoding='utf-8') as out:
        out.write(body_match.group(1))
    print('Wrote scratch/aether_body.html')
