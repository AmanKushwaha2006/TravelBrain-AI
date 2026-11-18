with open('dist/static/js/GLTFLoader.js', 'r', encoding='utf-8') as f:
    c = f.read()

print('Length of GLTFLoader.js:', len(c))
print('First 200 chars:')
print(c[:200])
