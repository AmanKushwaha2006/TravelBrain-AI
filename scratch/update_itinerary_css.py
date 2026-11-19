import re

css_path = r"c:\Users\Lenovo\Desktop\TravelBrain-Multi-Agent-AI-Travel-Planner\frontend\static\css\itinerary.css"

with open(css_path, "r", encoding="utf-8") as f:
    css = f.read()

# 1. Replace the .trip-hero section
hero_target_start = "/* ==================== TRIP OVERVIEW HERO SECTION ==================== */"
hero_target_end = "/* ==================== QUICK TRAVEL SUMMARY CARDS ==================== */"

idx1 = css.find(hero_target_start)
idx2 = css.find(hero_target_end)

if idx1 == -1 or idx2 == -1:
    print(f"Error: Hero markers not found. idx1: {idx1}, idx2: {idx2}")
    exit(1)

new_hero_css = '''/* ==================== TRIP OVERVIEW HERO SECTION (MAGAZINE COVER) ==================== */

.trip-hero {
  position: relative;
  border-radius: var(--radius-xl);
  min-height: 480px;
  display: flex;
  align-items: flex-end;
  padding: 56px 48px;
  margin-bottom: 36px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-elevated);
  background-color: #050B14;
}

.hero-cover-bg {
  position: absolute;
  inset: -15px;
  background-size: cover;
  background-position: center 35%;
  filter: brightness(0.62) saturate(1.15);
  transform: scale(1.02);
  transition: transform 6s cubic-bezier(0.25, 1, 0.5, 1);
  z-index: 0;
}

.trip-hero:hover .hero-cover-bg {
  transform: scale(1.06);
}

.hero-cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(5, 11, 20, 0.4) 0%, rgba(5, 11, 20, 0.78) 50%, #050B14 100%);
  z-index: 1;
  pointer-events: none;
}

.hero-cover-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 960px;
}

.hero-meta-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(5, 11, 20, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-gold);
  border-radius: var(--radius-full);
  color: var(--gold-light);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 18px;
}

.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(2.4rem, 5vw, 3.8rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.02em;
  margin-bottom: 14px;
  color: #FFFFFF;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.6);
}

.hero-title em {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  color: var(--gold-light);
  background: none;
  -webkit-text-fill-color: initial;
}

.hero-subtitle {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-weight: 500;
}

.hero-prologue {
  font-size: 1.02rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 20px;
  max-width: 820px;
  border-left: 2px solid var(--gold-primary);
  padding-left: 18px;
  font-style: normal;
}

.hero-summary-line {
  font-size: 0.92rem;
  color: var(--text-muted);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.hero-dot {
  color: var(--gold-primary);
  opacity: 0.7;
}

.hero-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: rgba(5, 11, 20, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  font-size: 0.82rem;
  font-weight: 500;
}

.hero-tag.tag-currency {
  background: rgba(212, 175, 55, 0.15);
  border-color: var(--border-gold);
  color: var(--gold-light);
  font-weight: 600;
}

.hero-quick-jumps {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.hero-jump-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 15px;
  border-radius: var(--radius-full);
  background: rgba(5, 11, 20, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  font-size: 0.82rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
}

.hero-jump-pill:hover {
  background: rgba(212, 175, 55, 0.18);
  border-color: var(--gold-primary);
  color: var(--gold-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(212, 175, 55, 0.2);
}

.hero-jump-pill.primary {
  background: linear-gradient(135deg, var(--gold-primary), #B8860B);
  color: #050B14;
  font-weight: 700;
  border-color: transparent;
}

.badge-inr {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid var(--border-gold);
  border-radius: var(--radius-full);
  color: var(--gold-light);
  font-size: 0.76rem;
  font-weight: 700;
  font-family: var(--font-mono);
}

'''

css = css[:idx1] + new_hero_css + css[idx2:]

# 2. Append new Magazine Editorial sections (Day Chapter, Highlights photography, Food, Packing, Badges)
additional_sections = '''
/* ==================== MAGAZINE DAY CHAPTERS & CARDS ==================== */

.day-chapter {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 36px 40px;
  margin-bottom: 36px;
  box-shadow: var(--shadow-subtle);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: border-color 0.3s ease;
}

.day-chapter:hover {
  border-color: var(--border-light);
}

.day-chapter-header {
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 20px;
  margin-bottom: 28px;
}

.chapter-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--gold-primary);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.chapter-title {
  font-family: var(--font-serif);
  font-size: 1.65rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: -0.01em;
  margin-bottom: 10px;
  line-height: 1.3;
}

.chapter-synopsis {
  font-size: 0.98rem;
  color: var(--text-muted);
  line-height: 1.65;
  max-width: 820px;
  font-style: italic;
}

.magazine-activity-card {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 22px 26px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.magazine-activity-card:hover {
  background: rgba(255, 255, 255, 0.045);
  border-color: var(--border-light);
  transform: translateX(5px);
  box-shadow: var(--shadow-subtle);
}

.badge-cost {
  background: rgba(16, 185, 129, 0.12);
  color: #34D399;
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: var(--radius-full);
  padding: 3px 9px;
  font-size: 0.74rem;
  font-weight: 600;
  font-family: var(--font-mono);
}

/* Overhaul Highlight Cards to Magazine Photography Cards */
.highlight-card {
  padding: 0 !important;
  overflow: hidden !important;
}

.highlight-img-wrap {
  position: relative;
  width: 100%;
  height: 190px;
  overflow: hidden;
  background: #0c1626;
}

.highlight-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  display: block;
}

.highlight-card:hover .highlight-img {
  transform: scale(1.06);
}

.highlight-img-wrap .highlight-cat-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: rgba(5, 11, 20, 0.85);
  backdrop-filter: blur(8px);
  color: var(--gold-light);
  border: 1px solid var(--border-gold);
}

.highlight-body {
  padding: 22px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

/* ==================== FOOD & CULINARY SCENE ==================== */

.food-section {
  margin-bottom: 48px;
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.food-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(14px);
}

.food-card:hover {
  border-color: var(--border-gold);
  transform: translateY(-5px);
  box-shadow: var(--shadow-elevated);
}

.food-img-wrap {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #0c1626;
}

.food-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  display: block;
}

.food-card:hover .food-img {
  transform: scale(1.06);
}

.food-cat-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: rgba(5, 11, 20, 0.85);
  backdrop-filter: blur(8px);
  color: var(--coral-accent);
  border: 1px solid rgba(255, 173, 115, 0.4);
}

.food-body {
  padding: 22px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.food-title {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8px;
  line-height: 1.3;
}

.food-desc {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

/* ==================== INTERACTIVE PACKING CHECKLIST ==================== */

.packing-checklist {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}

.packing-item-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-size: 0.88rem;
  color: var(--text-muted);
  transition: all 0.2s ease;
  padding: 4px 0;
}

.packing-item-label:hover {
  color: #FFFFFF;
}

.packing-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--border-light);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  margin-top: 2px;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.packing-checkbox:hover {
  border-color: var(--gold-primary);
}

.packing-checkbox:checked {
  background: var(--gold-primary);
  border-color: var(--gold-primary);
}

.packing-checkbox:checked::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 9px;
  border: solid #050B14;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.packing-checkbox:checked + .packing-item-text {
  text-decoration: line-through;
  opacity: 0.55;
}

.packing-item-text {
  line-height: 1.5;
}

@media (max-width: 768px) {
  .trip-hero {
    min-height: auto;
    padding: 36px 20px;
  }
  .hero-title {
    font-size: 2.1rem;
  }
  .hero-prologue {
    font-size: 0.92rem;
    padding-left: 12px;
  }
  .day-chapter {
    padding: 24px 18px;
  }
}
'''

css = css + additional_sections

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css)

print(f"Successfully updated {css_path}!")
