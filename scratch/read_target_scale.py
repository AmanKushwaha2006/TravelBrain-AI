with open('frontend/static/js/aviation-3d.js', 'r', encoding='utf-8') as f:
    c = f.read()

pos = c.find('targetScale')
while pos != -1:
    print('targetScale at:', pos)
    print(c[pos-20:pos+150])
    pos = c.find('targetScale', pos+1)
