with open('frontend/templates/index.html', 'r', encoding='utf-8') as f:
    orig = f.read()

pos = orig.find('id="chatSidebar"')
end_pos = orig.find('</aside>', pos)
print(orig[pos:end_pos+100])
