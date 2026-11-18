import struct
import json

with open('frontend/static/models/A350.glb', 'rb') as f:
    magic = f.read(4)
    version = struct.unpack('<I', f.read(4))[0]
    length = struct.unpack('<I', f.read(4))[0]
    chunk_length = struct.unpack('<I', f.read(4))[0]
    chunk_type = f.read(4)
    json_bytes = f.read(chunk_length)
    gltf = json.loads(json_bytes.decode('utf-8'))

print("Accessors with min/max:")
for acc in gltf.get('accessors', []):
    if 'min' in acc and 'max' in acc:
        print(acc['min'], acc['max'])
        break
