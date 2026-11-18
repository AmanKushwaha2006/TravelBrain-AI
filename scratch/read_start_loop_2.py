with open('frontend/static/js/aviation-3d.js', 'r', encoding='utf-8') as f:
    c = f.read()

pos = c.find('startLoop:')
print(c[pos+1800:pos+3500])
