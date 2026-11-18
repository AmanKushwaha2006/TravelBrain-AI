with open('frontend/templates/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print('=== SECOND PAGE (597 to 750) ===')
print(''.join(lines[596:750]))
