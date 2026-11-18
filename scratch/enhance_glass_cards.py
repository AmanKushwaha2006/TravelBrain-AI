with open('frontend/static/css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Enhance .box text-shadow for supreme contrast against bright clouds
css = css.replace(
    'text-shadow: 0 4px 30px rgba(7, 22, 35, 0.3);',
    'text-shadow: 0 2px 20px rgba(2, 10, 18, 0.9), 0 4px 45px rgba(2, 10, 18, 0.75);'
)

# Enhance .card-destination with luxurious frosted glass backing
old_dest = """.card-destination {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}"""

new_dest = """.card-destination {
  background: rgba(5, 18, 30, 0.52);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 22px;
  padding: 38px 40px;
  box-shadow: 0 18px 46px rgba(2, 10, 18, 0.55);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-destination:hover {
  background: rgba(5, 18, 30, 0.72);
  border-color: rgba(231, 201, 153, 0.6);
  transform: translateY(-4px);
  box-shadow: 0 24px 60px rgba(2, 10, 18, 0.7), 0 0 32px rgba(231, 201, 153, 0.22);
}"""

if old_dest in css:
    css = css.replace(old_dest, new_dest)
    print("Replaced .card-destination with luxury glass backing")
else:
    css += "\n\n" + new_dest
    print("Appended luxury .card-destination rule")

with open('frontend/static/css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

with open('dist/static/css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

# Update dist/test_fusion_render.html
with open('dist/test_fusion_render.html', 'r', encoding='utf-8') as f:
    h = f.read()

h = h.replace(
    'text-shadow: 0 4px 30px rgba(7,22,35,.25);',
    'text-shadow: 0 2px 20px rgba(2, 10, 18, 0.9), 0 4px 45px rgba(2, 10, 18, 0.75);'
)
if '.card-destination {' not in h:
    h = h.replace('</style>', new_dest + '\n</style>')

with open('dist/test_fusion_render.html', 'w', encoding='utf-8') as f:
    f.write(h)

print("Synchronized enhanced luxury glass cards.")
