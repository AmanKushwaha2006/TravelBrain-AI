with open('frontend/static/js/aviation-3d.js', 'r', encoding='utf-8') as f:
    c = f.read()

pos = c.find('self.airplane =')
print('=== self.airplane assignment ===')
print(c[pos-50:pos+350])
