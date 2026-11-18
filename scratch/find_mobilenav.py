with open('frontend/templates/index.html', 'r', encoding='utf-8') as f:
    orig = f.read()

pos = orig.find('id="mobileNavDrawer"')
end_pos = orig.find('</nav>', pos)
print(orig[pos:end_pos+100])
