with open('frontend/static/js/aviation-3d.js', 'r', encoding='utf-8') as f:
    c = f.read()

pos = c.find('cameraModes:')
print('=== cameraModes ===')
print(c[pos:pos+600])

cam_pos = c.find('setupScene:')
print('=== setupScene ===')
print(c[cam_pos:cam_pos+600])
