with open('frontend/templates/index.html', 'r', encoding='utf-8') as f:
    orig = f.read()

pos = orig.find('<!-- ==================== SETTINGS MODAL ==================== -->')
print(orig[pos:pos+1500])
