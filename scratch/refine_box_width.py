with open('frontend/static/css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Make .box slightly wider for search bar
css = css.replace(
    '.box {\n  width: min(560px, 48vw);',
    '.box {\n  width: min(640px, 56vw);'
)

# Ensure .btn-plan-journey never truncates or clips text
btn_rule = """.btn-plan-journey {
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}"""

if '.btn-plan-journey {' in css and 'white-space: nowrap' not in css:
    css += "\n\n" + btn_rule

with open('frontend/static/css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

with open('dist/static/css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Updated styles.css with wider box and non-wrapping button.")
