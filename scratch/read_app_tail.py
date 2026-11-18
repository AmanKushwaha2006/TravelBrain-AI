with open('frontend/static/js/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print('Last 60 lines of app.js:')
print(''.join(lines[-60:]))
