with open('frontend/templates/index.html', 'r', encoding='utf-8') as f:
    orig = f.read()

s = orig.find('<!-- ==================== FLOATING GLASS NAVBAR')
e = orig.find('<!-- ==================== MAIN PAGE CONTENT')
print(orig[s:e])
