with open('scratch/aether_append.css', 'r', encoding='utf-8') as f:
    append_css = f.read()

with open('frontend/static/css/styles.css', 'r', encoding='utf-8') as f:
    original_css = f.read()

if 'AETHER LUXURY EDITORIAL SYSTEM' not in original_css:
    with open('frontend/static/css/styles.css', 'a', encoding='utf-8') as f:
        f.write('\n\n' + append_css)
    print('Successfully appended Aether styles to styles.css')
else:
    print('Aether styles already present in styles.css')
