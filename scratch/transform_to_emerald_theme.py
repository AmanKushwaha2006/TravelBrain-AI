# -*- coding: utf-8 -*-
"""
Transform frontend/static/css/itinerary.css and HTML from Blue to Emerald Jade & Champagne Gold theme.
Also fixes grid auto-fit so the right side is never blank.
"""
import os
import shutil

BASE_DIR = r"c:\Users\Lenovo\Desktop\TravelBrain-Multi-Agent-AI-Travel-Planner"

# 1. Update CSS
css_path = os.path.join(BASE_DIR, "frontend", "static", "css", "itinerary.css")
with open(css_path, "r", encoding="utf-8") as f:
    css = f.read()

# Update :root header comment and colors
old_root_header = """/* ============================================================
   TravelBrain AI — Generated Itinerary Dashboard Stylesheet
   Luxury Editorial Aesthetic · Midnight Navy & Champagne Gold
   ============================================================ */"""

new_root_header = """/* ============================================================
   TravelBrain AI — Generated Itinerary Dashboard Stylesheet
   Luxury Editorial Aesthetic · Emerald Jade & Champagne Gold
   ============================================================ */"""
css = css.replace(old_root_header, new_root_header)

# Replace Palette definitions in :root
old_palette = """  /* Palette */
  --bg-dark: #050B14;
  --bg-card: rgba(11, 20, 36, 0.72);
  --bg-card-hover: rgba(16, 29, 52, 0.88);
  --bg-card-solid: #0c1626;
  --bg-glass: rgba(13, 24, 44, 0.55);
  --bg-subtle: rgba(255, 255, 255, 0.03);

  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-light: rgba(255, 255, 255, 0.14);
  --border-gold: rgba(212, 175, 55, 0.35);
  --border-gold-strong: rgba(212, 175, 55, 0.75);

  --gold-primary: #D4AF37;
  --gold-light: #F3E5AB;
  --gold-glow: rgba(212, 175, 55, 0.22);
  --blue-sky: #55B8E8;
  --blue-glow: rgba(85, 184, 232, 0.25);
  --coral-accent: #FFAD73;
  --emerald: #10B981;

  --text-main: #FFFFFF;
  --text-muted: #8E9BAE;
  --text-dim: #5A6980;
  --text-gold: #E5C07B;"""

new_palette = """  /* Palette - Luxury Emerald Jade & Warm Champagne Gold */
  --bg-dark: #070B09;
  --bg-card: rgba(13, 22, 18, 0.82);
  --bg-card-hover: rgba(18, 30, 24, 0.94);
  --bg-card-solid: #0e1814;
  --bg-glass: rgba(14, 24, 19, 0.72);
  --bg-subtle: rgba(255, 255, 255, 0.03);

  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-light: rgba(255, 255, 255, 0.14);
  --border-gold: rgba(212, 175, 55, 0.35);
  --border-gold-strong: rgba(212, 175, 55, 0.75);
  --border-emerald: rgba(16, 185, 129, 0.35);

  --gold-primary: #D4AF37;
  --gold-light: #F3E5AB;
  --gold-glow: rgba(212, 175, 55, 0.22);
  
  /* Primary Accent: Emerald Jade (Replacing Blue) */
  --emerald-primary: #10B981;
  --emerald-light: #34D399;
  --emerald-glow: rgba(16, 185, 129, 0.28);
  --emerald-deep: #064E3B;
  --blue-sky: #10B981;
  --blue-glow: rgba(16, 185, 129, 0.28);

  --coral-accent: #FF7A59;
  --emerald: #10B981;

  --text-main: #FFFFFF;
  --text-muted: #94A398;
  --text-dim: #5C6E62;
  --text-gold: #E5C07B;"""

if old_palette in css:
    css = css.replace(old_palette, new_palette)
    print("Replaced :root palette")
else:
    print("Warning: old_palette not matched exactly in css")

# Replace blue colors across css
css = css.replace("85, 184, 232", "16, 185, 129")
css = css.replace("#55B8E8", "#10B981")
css = css.replace("#55b8e8", "#10B981")
css = css.replace("#050B14", "#070B09")
css = css.replace("#050b14", "#070B09")
css = css.replace("#081120", "#0A110D")
css = css.replace("#0c1626", "#0E1814")
css = css.replace("#0D2847", "#064E3B")
css = css.replace("#0A1C30", "#0D1913")
css = css.replace("#030810", "#070B09")

# Update .day-cards-grid to auto-fit and add fallback card width
old_grid = """.day-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 26px;
  align-items: stretch;
  margin-bottom: 40px;
}"""

new_grid = """.day-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 26px;
  align-items: stretch;
  margin-bottom: 40px;
  width: 100%;
}

.itinerary-day-card.fallback-card {
  grid-column: 1 / -1;
  width: 100%;
  max-width: 100%;
}"""

if old_grid in css:
    css = css.replace(old_grid, new_grid)
    print("Updated day-cards-grid to auto-fit and added fallback card styling")
else:
    print("Warning: old_grid not matched; attempting regex replacement")
    css = re.sub(
        r'\.day-cards-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(auto-fill,[^}]+\}',
        new_grid,
        css
    )

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css)
print("Saved frontend/static/css/itinerary.css")

# Copy CSS to dist
dist_css = os.path.join(BASE_DIR, "dist", "static", "css", "itinerary.css")
shutil.copy(css_path, dist_css)
print("Copied to dist/static/css/itinerary.css")

# 2. Update HTML (frontend/templates/itinerary.html)
html_path = os.path.join(BASE_DIR, "frontend", "templates", "itinerary.html")
with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

# Replace any blue references in HTML
html = html.replace("#55B8E8", "#10B981")
html = html.replace("#55b8e8", "#10B981")
html = html.replace("#050B14", "#070B09")
html = html.replace("#050b14", "#070B09")
html = html.replace("#030810", "#070B09")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)
print("Saved frontend/templates/itinerary.html")

# Copy HTML to dist
dist_itin = os.path.join(BASE_DIR, "dist", "itinerary.html")
dist_trip = os.path.join(BASE_DIR, "dist", "trip-plan.html")
shutil.copy(html_path, dist_itin)
shutil.copy(html_path, dist_trip)
print("Copied to dist/itinerary.html and dist/trip-plan.html")
