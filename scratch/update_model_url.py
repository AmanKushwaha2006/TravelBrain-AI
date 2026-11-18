with open('frontend/static/js/aviation-3d.js', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'loader.load(\n        "/static/models/A350.glb",',
    'var modelUrl = window.location.protocol === "file:" ? "./static/models/A350.glb" : "/static/models/A350.glb";\n      loader.load(\n        modelUrl,'
)

c = c.replace(
    'loader.load(\n        "/static/models/A320.glb",',
    'var fallbackUrl = window.location.protocol === "file:" ? "./static/models/A320.glb" : "/static/models/A320.glb";\n      loader.load(\n        fallbackUrl,'
)

with open('frontend/static/js/aviation-3d.js', 'w', encoding='utf-8') as f:
    f.write(c)

with open('dist/static/js/aviation-3d.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated aviation-3d.js with protocol-aware model path.")
