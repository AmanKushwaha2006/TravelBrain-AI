with open('frontend/static/js/aviation-3d.js', 'r', encoding='utf-8') as f:
    c = f.read()

pos = c.find('startLoop:')
print('=== startLoop ===')
print(c[pos:pos+2000])
