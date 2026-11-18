with open('frontend/templates/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print('=== PLANNING SECTION (555 to 598) ===')
print(''.join(lines[554:598]))
