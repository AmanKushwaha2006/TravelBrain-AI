with open('dist/test_fusion_render.html', 'r', encoding='utf-8') as f:
    c = f.read()

pos = c.find('id="journeys"')
print(c[pos-50:pos+800])
