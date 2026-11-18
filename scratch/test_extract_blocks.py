with open('frontend/templates/index.html', 'r', encoding='utf-8') as f:
    orig = f.read()

def extract_section(start_str, end_str):
    s = orig.find(start_str)
    if s == -1:
        raise ValueError(f"Start string not found: {start_str[:40]}")
    e = orig.find(end_str, s)
    if e == -1:
        raise ValueError(f"End string not found: {end_str[:40]}")
    return orig[s:e]

# 1. Chat sidebar
sidebar_html = extract_section('<!-- ==================== CHATGPT-STYLE LEFT SIDEBAR', '<div class="sidebar-backdrop"')
backdrop_end = orig.find('</div>', orig.find('<div class="sidebar-backdrop"')) + 6
sidebar_full = orig[orig.find('<!-- ==================== CHATGPT-STYLE LEFT SIDEBAR'):backdrop_end]
print("Sidebar found:", len(sidebar_full))

# 2. Setup gate
gate_html = extract_section('<section class="gate" id="setupGate"', '<!-- ==================== LIVE PLANNING')
print("Gate found:", len(gate_html))

# 3. Planning section
plan_html = extract_section('<div class="planning-section" id="planningSection"', '<!-- ==================== "SECOND PAGE"')
print("Planning found:", len(plan_html))

# 4. Auth modal
auth_html = extract_section('<!-- ==================== AUTHENTICATION MODAL', '<!-- ==================== SETTINGS MODAL')
print("Auth modal found:", len(auth_html))

# 5. Settings modal + Toast
settings_toast_html = extract_section('<!-- ==================== SETTINGS MODAL', '<!-- Scripts: Three.js')
print("Settings + Toast found:", len(settings_toast_html))
