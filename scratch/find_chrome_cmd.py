with open('scratch/test_fusion_render.py', 'r', encoding='utf-8') as f:
    c = f.read()

pos = c.find('chrome_exe =')
if pos == -1:
    pos = c.find('subprocess.run')
print(c[pos-50:pos+350])
