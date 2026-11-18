import shutil

shutil.copyfile('frontend/templates/index.html', 'dist/index.html')
shutil.copyfile('frontend/static/css/styles.css', 'dist/static/css/styles.css')
shutil.copyfile('frontend/static/js/aviation-3d.js', 'dist/static/js/aviation-3d.js')
shutil.copyfile('frontend/static/js/app.js', 'dist/static/js/app.js')

print("All files synchronized to dist/ successfully.")
