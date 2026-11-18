with open('frontend/static/js/aviation-3d.js', 'r', encoding='utf-8') as f:
    c = f.read()

pos = c.find('loadAirplaneModel')
print('=== loadAirplaneModel ===')
print(c[pos:pos+1500])
