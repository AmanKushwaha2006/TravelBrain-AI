with open('frontend/templates/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if any(k in line for k in ['secondPage', 'planningSection', 'how-it-works', 'features', 'footer']):
        print(f'{i+1}: {line.strip()[:100]}')
