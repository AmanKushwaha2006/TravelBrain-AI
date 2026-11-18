with open('app.py', 'r', encoding='utf-8') as f:
    c = f.read()

pos = c.find('app.mount')
print(c[pos:pos+500])
