import re

# Read original index.html to extract critical modals, forms, and gates verbatim
with open('frontend/templates/index.html', 'r', encoding='utf-8') as f:
    orig = f.read()

# Helper to extract a block by regex
def get_block(start_pat, end_pat):
    m = re.search(f'({start_pat}.*?{end_pat})', orig, re.DOTALL)
    if not m:
        raise ValueError(f"Could not find block {start_pat} ... {end_pat}")
    return m.group(1)

# Extract Auth Modal
auth_modal = get_block(r'<!-- ==================== AUTHENTICATION MODAL ==================== -->', r'<!-- ==================== SETTINGS MODAL ==================== -->')
auth_modal = auth_modal[:auth_modal.rfind('<!-- ==================== SETTINGS MODAL')]

# Extract Settings Modal
settings_modal = get_block(r'<!-- ==================== SETTINGS MODAL ==================== -->', r'<!-- Toast Notifications -->')
settings_modal = settings_modal[:settings_modal.rfind('<!-- Toast Notifications -->')]

# Extract Toast
toast_block = """  <!-- Toast Notifications -->
  <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>"""

# Extract Setup Gate
setup_gate = get_block(r'<section class="gate" id="setupGate"', r'</section>\s*<!-- ==================== LIVE PLANNING')
setup_gate = setup_gate[:setup_gate.rfind('<!-- ==================== LIVE PLANNING')].strip()

# Extract Planning Section
planning_section = get_block(r'<div class="planning-section" id="planningSection"', r'<!-- ==================== "SECOND PAGE"')
planning_section = planning_section[:planning_section.rfind('<!-- ==================== "SECOND PAGE"')].strip()

# Extract Mobile Nav Drawer
mobile_nav = get_block(r'<!-- Mobile Navigation Drawer -->', r'<!-- ==================== MAIN PAGE CONTENT')
mobile_nav = mobile_nav[:mobile_nav.rfind('<!-- ==================== MAIN PAGE CONTENT')].strip()

# Extract Chat Sidebar
chat_sidebar = get_block(r'<!-- Slide-out Chat History Sidebar / Drawer -->', r'<!-- ==================== FLOATING GLASS NAVBAR')
chat_sidebar = chat_sidebar[:chat_sidebar.rfind('<!-- ==================== FLOATING GLASS NAVBAR')].strip()

new_html = f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TravelBrain — Above the Ordinary | Autonomous Multi-Agent AI Travel Planner</title>
  <meta name="description" content="TravelBrain AI: Luxury editorial aviation travel planning powered by LangGraph multi-agent AI swarms. Flight, stays, meteorology and verified itineraries in Indian Rupees (₹)." />
  <link rel="stylesheet" href="/static/css/styles.css?v=3.6.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Manrope:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    /* Critical Anti-FOUC & Layout Lockdown for Sidebar */
    .chat-sidebar {{
      position: fixed !important;
      top: 0 !important;
      bottom: 0 !important;
      left: 0 !important;
      width: 310px !important;
      max-width: 85vw !important;
      height: 100vh !important;
      height: 100dvh !important;
      margin: 0 !important;
      padding: 0 !important;
      background: rgba(6, 18, 34, 0.96) !important;
      backdrop-filter: blur(24px) !important;
      -webkit-backdrop-filter: blur(24px) !important;
      border-right: 1px solid rgba(85, 184, 232, 0.2) !important;
      z-index: 1002 !important;
      display: flex !important;
      flex-direction: column !important;
      transform: translateX(-100%) !important;
      visibility: hidden !important;
      pointer-events: none !important;
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.28s !important;
      box-shadow: 12px 0 35px rgba(0, 0, 0, 0.6) !important;
      box-sizing: border-box !important;
    }}
    body.sidebar-open .chat-sidebar {{
      transform: translateX(0) !important;
      visibility: visible !important;
      pointer-events: auto !important;
    }}
    .sidebar-backdrop {{
      position: fixed !important;
      inset: 0 !important;
      background: rgba(3, 10, 20, 0.65) !important;
      backdrop-filter: blur(4px) !important;
      -webkit-backdrop-filter: blur(4px) !important;
      z-index: 1001 !important;
      opacity: 0 !important;
      pointer-events: none !important;
      transition: opacity 0.25s ease !important;
    }}
    body.sidebar-open .sidebar-backdrop {{
      opacity: 1 !important;
      pointer-events: auto !important;
    }}
  </style>
</head>
<body class="page-body">

  <!-- Aether Dynamic Sky Stage Atmosphere -->
  <div class="stage" id="skyStage" aria-hidden="true">
    <div class="sun" id="sun"></div>
    <div id="clouds"></div>
  </div>

  <!-- Persistent 3D WebGL Flight Deck (Airbus A350) -->
  <div class="aviation-canvas-container" id="aviation-canvas-container" aria-hidden="true"></div>

  <!-- 35mm Aerospace Film Grain -->
  <div class="grain" aria-hidden="true"></div>

  {chat_sidebar}

  <!-- ==================== FLOATING EDITORIAL NAVBAR ==================== -->
  <header class="navbar" id="navbar">
    <div class="navbar-container">
      
      <div class="nav-left">
        <button type="button" class="nav-icon-btn sidebar-toggle-btn" id="navToggleBtn" aria-label="Toggle Trip History" title="View Saved & Recent Trips">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        </button>

        <a href="#hero" class="brand-link" aria-label="TravelBrain Homepage">
          <span class="brand-mark">✳</span>
          <span class="brand-text">Travel<strong>Brain</strong> <span class="badge-accent">AI 2.0</span></span>
        </a>
      </div>

      <nav class="nav-links" id="navLinks">
        <a href="#hero" class="nav-link on">Home</a>
        <a href="#journeys" class="nav-link">Journeys</a>
        <a href="#how-it-works" class="nav-link">Workflow</a>
        <a href="#features" class="nav-link">Cabins</a>
        <a href="#contact" class="nav-link">Contact</a>
        
        <div class="api-status-pill" id="apiStatusIndicator" title="API Status">
          <span class="status-dot"></span>
          <span class="status-label" id="apiStatusText">API connected</span>
        </div>

        <button type="button" class="currency-badge-btn" id="currencySelectBtn" title="Change currency">
          <span class="curr-flag">IN</span>
          <span class="curr-code">INR (₹)</span>
        </button>

        <button type="button" class="btn btn-primary btn-sm new-trip-nav-btn" id="newTripBtn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>New Trip</span>
        </button>

        <button type="button" class="nav-icon-btn" id="btnSettings" aria-label="Open Settings" title="Configure API & Preferences">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>

        <button type="button" class="nav-icon-btn theme-toggle-btn" id="themeToggleBtn" aria-label="Toggle Light/Dark Theme" title="Toggle Theme">
          <svg class="sun-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
          </svg>
          <svg class="moon-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
          </svg>
        </button>

        <button type="button" class="btn btn-outline btn-sm auth-nav-btn" id="btnAuth">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="auth-btn-label">Sign In</span>
        </button>
      </nav>

    </div>
  </header>

  {mobile_nav}

  <!-- ==================== MAIN CONTENT ==================== -->
  <main class="page-content" id="conversation">

    <!-- SCENE 1: HERO & FLIGHT DISPATCH -->
    <section class="scene hero" id="hero">
      <div class="box">
        <div class="eyebrow">TravelBrain Journal · 01</div>
        <h1>Above the <em>ordinary.</em></h1>
        <p>A quieter kind of escape. Autonomous multi-agent AI orchestrates your flights, boutique stays, meteorology, and verified itinerary in Indian Rupees (₹).</p>
        
        <!-- Luxury Glass Cockpit Search Console -->
        <div class="search-panel-wrapper">
          <form class="aviation-search-panel" id="searchPanel" autocomplete="off">
            
            <div class="asp-field">
              <label for="fFrom" class="asp-label">Origin</label>
              <div class="asp-input-wrap">
                <svg class="asp-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                </svg>
                <input type="text" id="fFrom" placeholder="New Delhi (DEL)" value="New Delhi" aria-label="Departure City" />
              </div>
            </div>

            <div class="asp-divider" aria-hidden="true"></div>

            <div class="asp-field">
              <label for="fTo" class="asp-label">Destination</label>
              <div class="asp-input-wrap">
                <svg class="asp-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <input type="text" id="fTo" placeholder="Manali, Himachal" value="Manali" aria-label="Destination City" />
              </div>
            </div>

            <div class="asp-divider" aria-hidden="true"></div>

            <div class="asp-field asp-field-days">
              <label for="fDays" class="asp-label">Duration</label>
              <div class="asp-input-wrap">
                <svg class="asp-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <input type="number" id="fDays" min="1" max="30" value="5" aria-label="Trip Duration in Days" />
                <span class="asp-unit">Days</span>
              </div>
            </div>

            <button type="button" class="btn btn-primary btn-plan-journey" id="btnPlanJourney">
              <span>Plan Journey</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

          </form>

          <div class="quick-prompts-bar">
            <span class="qp-label">Popular Expeditions:</span>
            <button type="button" class="qp-chip destination-card" data-from="New Delhi" data-to="Manali" data-days="5">🏔️ Manali 5D</button>
            <button type="button" class="qp-chip destination-card" data-from="Mumbai" data-to="Goa" data-days="4">🏖️ Goa 4D</button>
            <button type="button" class="qp-chip destination-card" data-from="Delhi" data-to="Ladakh" data-days="6">🏍️ Ladakh 6D</button>
            <button type="button" class="qp-chip destination-card" data-from="Bengaluru" data-to="Kerala" data-days="5">🌴 Kerala 5D</button>
            <button type="button" class="qp-chip destination-card" data-from="Mumbai" data-to="Tokyo" data-days="7">🗼 Tokyo 7D</button>
          </div>
        </div>

        <div class="cue">Scroll to open</div>
      </div>
    </section>

    {setup_gate}

    {planning_section}

    <!-- ==================== EDITORIAL STORY SCENES ==================== -->
    <div class="second-page-wrap" id="secondPage">
      
      <!-- SCENE 2: EDITORIAL JOURNEYS -->
      <section id="journeys">
        <div class="scene">
          <div class="box card-destination destination-card" data-from="New Delhi" data-to="Manali" data-days="5">
            <span class="place">Alpine escape</span>
            <h2>Chase the <em>first light.</em></h2>
            <p>Depart at dawn and land beside glacier-fed valleys and pine forests before the world wakes.</p>
            <span class="btn-vignette">Fly this route →</span>
          </div>
        </div>

        <div class="scene">
          <div class="box card-destination destination-card" data-from="Mumbai" data-to="Goa" data-days="4">
            <span class="place">Coastal retreat</span>
            <h2>Salt air, <em>quiet runways.</em></h2>
            <p>Skip the terminal rush. Step off the aircraft and straight into Arabian Sea breezes and coastal villas.</p>
            <span class="btn-vignette">Fly this route →</span>
          </div>
        </div>

        <div class="scene">
          <div class="box card-destination destination-card" data-from="Delhi" data-to="Jaisalmer" data-days="4">
            <span class="place">Desert light</span>
            <h2>Golden hour, <em>all day.</em></h2>
            <p>Cross open desert horizons while sandstone forts and golden dunes turn amber beneath the wing.</p>
            <span class="btn-vignette">Fly this route →</span>
          </div>
        </div>

        <div class="scene">
          <div class="box card-destination destination-card" data-from="Mumbai" data-to="Tokyo" data-days="7">
            <span class="place">Far horizons</span>
            <h2>Arrive in the <em>middle of it all.</em></h2>
            <p>Neon boulevards, Michelin dining, and bullet-train pacing choreographed with precision.</p>
            <span class="btn-vignette">Fly this route →</span>
          </div>
        </div>
      </section>

      <!-- SCENE 3: WORKFLOW -->
      <section class="scene" id="how-it-works">
        <div class="box wide">
          <div class="eyebrow">Aviation Workflow · 02</div>
          <h2>No queues. <em>No noise.</em></h2>
          <p>Tell us where. Specialized LangGraph AI agents research flights, verify accommodations, forecast meteorology, and audit routes before you reach the gate.</p>
          <div class="cards">
            <div class="card">
              <div class="card-step-num">01 / ROUTE & INTENT</div>
              <b>Intelligent Route Input</b>
              <span>Specify your departure city, destination, and trip duration. Natural language intent parsing automatically detects pace, budget, and travel style.</span>
            </div>
            <div class="card">
              <div class="card-step-num">02 / PARALLEL AI</div>
              <b>Parallel Swarm Research</b>
              <span>Specialized AI agents query flight hubs, boutique hotels, seasonal weather, and cultural attractions concurrently across real-time databases.</span>
            </div>
            <div class="card">
              <div class="card-step-num">03 / CRITIC AUDIT</div>
              <b>Anti-Hallucination Critic Audit</b>
              <span>Our proprietary Critic Agent performs rigorous fact-checking on every landmark, route, and schedule to eliminate AI hallucinations.</span>
            </div>
          </div>
        </div>
      </section>

      <!-- SCENE 4: CABINS & CAPABILITIES -->
      <section class="scene" id="features">
        <div class="box wide">
          <div class="eyebrow">Platform Capabilities · 03</div>
          <h2>Three cabins. <em>One calm.</em></h2>
          <p>Pick the intelligence tier you want to cross the sky with.</p>
          <div class="cards">
            <div class="card">
              <div class="card-step-num">CABIN A</div>
              <b>Lounge — Leisure Dossier</b>
              <span>Curated leisure escapes, scenic transfers, boutique hideaways, and verified culinary recommendations in direct Indian Rupees (₹).</span>
            </div>
            <div class="card">
              <div class="card-step-num">CABIN B</div>
              <b>Studio — High-Velocity Executive</b>
              <span>Tight, minute-by-minute business agendas, airport lounges, fast transit, and high-productivity stays with zero latency.</span>
            </div>
            <div class="card">
              <div class="card-step-num">CABIN C</div>
              <b>Retreat — Deep Slow Travel</b>
              <span>Multi-day slow travel, mountain wellness, cultural expeditions, and scenic off-grid tranquility with adaptive pacing.</span>
            </div>
          </div>
        </div>
      </section>

      <!-- SCENE 5: CONTACT & DISPATCH -->
      <section class="scene end" id="contact">
        <div class="box">
          <div class="eyebrow">Ready to Fly · 04</div>
          <h2>Ready to <em>fly again.</em></h2>
          <p>Share your dates and destination. Our multi-agent AI swarm will craft the verified flight-deck dossier in under 60 seconds.</p>
          <a class="btn-gold" href="#hero">Plan a Journey ↑</a>
          <div class="foot-nav">
            <a href="#journeys">Journeys</a>
            <a href="#how-it-works">Workflow</a>
            <a href="#features">Cabins</a>
            <a href="#hero">Back to top</a>
          </div>
        </div>
      </section>

    </div>

    <!-- Legacy Footer for SEO & Links -->
    <footer class="footer" style="position:relative; z-index:10; background:rgba(3,16,28,0.9);">
      <div class="footer-container">
        <div class="footer-brand">
          <span class="footer-title">Travel<strong>Brain</strong></span>
          <p class="footer-copy">Autonomous Multi-Agent AI Travel Planning. Verified travel itineraries in Indian Rupees (₹).</p>
        </div>
        <div class="footer-nav">
          <div class="footer-col">
            <h4>Platform</h4>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Key Features</a>
            <a href="#hero">Plan Journey</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 TravelBrain AI. Luxury Editorial Aviation Edition.</p>
        </div>
      </div>
    </footer>

  </main>

  {auth_modal}

  {settings_modal}

  {toast_block}

  <!-- ==================== REAL-TIME AVIATION TELEMETRY HUD ==================== -->
  <footer class="hud" id="aviationHud">
    <div class="meta">
      <div class="mi">
        <span class="ml">Flight no.</span>
        <span class="mv">TB—001 / 26</span>
      </div>
      <div class="mi">
        <span class="ml">Status</span>
        <span class="mv"><i class="live"></i><span id="st">Boarding</span></span>
      </div>
      <div class="mi">
        <span class="ml">Altitude</span>
        <span class="mv" id="alt">0 ft</span>
      </div>
      <div class="mi">
        <span class="ml">Speed</span>
        <span class="mv" id="spd">M 0.00</span>
      </div>
    </div>
    <div class="ctrl">
      <span>Flight film</span>
      <span class="bar"><i id="bar"></i></span>
      <span id="pct">00%</span>
      <a class="up" href="#hero" aria-label="Replay from the start">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 19V5m-6 6 6-6 6 6"/>
        </svg>
      </a>
    </div>
  </footer>

  <!-- Three.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <!-- GSAP Core & ScrollTrigger for Animations -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Local Scripts -->
  <script src="/static/js/GLTFLoader.js"></script>
  <script src="/static/js/aviation-3d.js?v=3.5.0"></script>
  <script src="/static/js/markdown.js"></script>
  <script src="/static/js/animated-content.js?v=1.0.0"></script>
  <script src="/static/js/app.js?v=3.5.0"></script>
</body>
</html>
"""

# Verify all original IDs are present in new_html
with open('scratch/orig_ids.txt', 'r', encoding='utf-8') as f:
    orig_ids = [line.strip() for line in f if line.strip()]

new_ids = set(re.findall(r'id=["\']([^"\']+)["\']', new_html))
missing = [i for i in orig_ids if i not in new_ids]

print(f"Original IDs: {len(orig_ids)}")
print(f"New IDs: {len(new_ids)}")
print(f"Missing IDs: {missing}")

if not missing:
    with open('frontend/templates/index.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("SUCCESS: frontend/templates/index.html written with all 79 IDs intact!")
else:
    print("ERROR: Missing IDs, not writing file.")
