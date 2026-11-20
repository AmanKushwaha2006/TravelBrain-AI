# -*- coding: utf-8 -*-
import os
import shutil

BASE_DIR = r"c:\Users\Lenovo\Desktop\TravelBrain-Multi-Agent-AI-Travel-Planner"

# 1. Update styles.css
styles_path = os.path.join(BASE_DIR, "frontend", "static", "css", "styles.css")
with open(styles_path, "r", encoding="utf-8") as f:
    st = f.read()

st = st.replace("--sky-blue: #55b8e8;", "--sky-blue: #10B981;")
st = st.replace("--sky-hover: #3fa4d6;", "--sky-hover: #059669;")
st = st.replace("#55B8E8", "#10B981")
st = st.replace("#55b8e8", "#10B981")
st = st.replace("85, 184, 232", "16, 185, 129")
st = st.replace("#050B14", "#070B09")
st = st.replace("#030810", "#070B09")

with open(styles_path, "w", encoding="utf-8") as f:
    f.write(st)
print("Updated frontend/static/css/styles.css")

# Copy styles to dist
dist_styles = os.path.join(BASE_DIR, "dist", "static", "css", "styles.css")
if os.path.exists(os.path.dirname(dist_styles)):
    shutil.copy(styles_path, dist_styles)
    print("Copied to dist/static/css/styles.css")

# 2. Update index.html
index_path = os.path.join(BASE_DIR, "frontend", "templates", "index.html")
with open(index_path, "r", encoding="utf-8") as f:
    idx_content = f.read()

idx_content = idx_content.replace("#55B8E8", "#10B981")
idx_content = idx_content.replace("#55b8e8", "#10B981")
idx_content = idx_content.replace("#050B14", "#070B09")
idx_content = idx_content.replace("#030810", "#070B09")

with open(index_path, "w", encoding="utf-8") as f:
    f.write(idx_content)
print("Updated frontend/templates/index.html")

dist_index = os.path.join(BASE_DIR, "dist", "index.html")
if os.path.exists(os.path.dirname(dist_index)):
    shutil.copy(index_path, dist_index)
    print("Copied to dist/index.html")
