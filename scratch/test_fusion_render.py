import subprocess
import os
from pathlib import Path

# Create a test render fusing Aether template with TravelBrain
test_html = """<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>TravelBrain — Above the Ordinary</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./static/css/styles.css">
  <style>
    /* Aether Fusion Override Styles */
    :root {
      --font-main: 'Manrope', system-ui, sans-serif;
      --font-mono: 'DM Mono', monospace;
      --gold: #e7c999;
      --line: rgba(255, 255, 255, 0.2);
      --ink: #f6f8f6;
      --muted: rgba(245, 248, 248, 0.74);
    }
    body {
      font-family: var(--font-main);
      color: var(--ink);
    }
    .grain {
      position: fixed;
      inset: -50%;
      z-index: 5;
      pointer-events: none;
      opacity: .07;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E");
      animation: grain .24s steps(2) infinite;
    }
    @keyframes grain {
      0%{transform:translate(0,0)}
      33%{transform:translate(-2%,1%)}
      66%{transform:translate(2%,-2%)}
      100%{transform:translate(-1%,2%)}
    }
    .hud {
      position: fixed;
      left: 0; right: 0; bottom: 0;
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 16px 5.2vw 22px;
      background: linear-gradient(transparent, rgba(3, 16, 28, 0.7));
      pointer-events: none;
      font-family: var(--font-mono);
    }
    .hud > * { pointer-events: auto; }
    .hud .meta { display: flex; gap: 32px; }
    .hud .mi { display: flex; flex-direction: column; gap: 5px; }
    .hud .ml { font-size: 9px; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.58); }
    .hud .mv { font-size: 12px; font-weight: 500; letter-spacing: .06em; color: var(--ink); }
    .hud .live { display: inline-block; width: 6px; height: 6px; margin-right: 8px; border-radius: 50%; background: #34d399; box-shadow: 0 0 10px #34d399; animation: blink 1.8s infinite; }
    @keyframes blink { 50% { opacity: .35; } }
    .hud .ctrl { display: flex; align-items: center; gap: 16px; font-size: 9px; letter-spacing: .13em; color: rgba(255,255,255,.75); text-transform: uppercase; }
    .hud .bar { width: 92px; height: 2px; background: rgba(255,255,255,.25); position: relative; }
    .hud .bar i { position: absolute; inset: 0 auto 0 0; width: 0; background: var(--gold); }
    .hud .up { width: 38px; height: 38px; border: 1px solid var(--line); border-radius: 50%; background: rgba(255,255,255,.08); display: grid; place-items: center; backdrop-filter: blur(8px); color: #fff; }
    .scene { min-height: 90vh; display: flex; align-items: center; padding: 0 9.3vw; position: relative; z-index: 2; }
    .scene.hero { min-height: 100vh; padding-top: 80px; }
    .box { width: min(520px, 46vw); will-change: transform, opacity; text-shadow: 0 4px 30px rgba(7,22,35,.25); }
    .box.wide { width: min(1000px, 86vw); }
    .eyebrow { display: flex; align-items: center; gap: 13px; margin-bottom: 20px; font: 10px var(--font-mono); letter-spacing: .25em; text-transform: uppercase; color: var(--gold); }
    .eyebrow::before { content: ""; height: 1px; width: 32px; background: var(--gold); }
    .place { display: block; margin-bottom: 14px; font: 10px var(--font-mono); letter-spacing: .22em; text-transform: uppercase; color: var(--gold); }
    h1, h2 { margin: 0 0 20px; font-weight: 300; letter-spacing: -.05em; line-height: 1.05; }
    h1 { font-size: clamp(44px, 6.2vw, 90px); }
    h2 { font-size: clamp(32px, 4.2vw, 60px); }
    h1 em, h2 em { font-style: normal; font-weight: 600; color: #fff; }
    .cue { margin-top: 36px; display: flex; align-items: center; gap: 14px; font: 10px var(--font-mono); letter-spacing: .2em; text-transform: uppercase; color: var(--muted); }
    .cue::after { content: ""; width: 1px; height: 42px; background: linear-gradient(rgba(255,255,255,.7), transparent); animation: drip 2.2s ease-in-out infinite; transform-origin: top; }
    @keyframes drip { 0%{transform:scaleY(0)} 60%{transform:scaleY(1)} 100%{transform:scaleY(1);opacity:0} }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 32px; }
    .card { padding: 24px 22px; border: 1px solid var(--line); border-radius: 14px; background: rgba(7,28,43,.45); backdrop-filter: blur(16px); }
    .card b { display: block; margin-bottom: 8px; font-size: 18px; font-weight: 600; color: #fff; }
    .card span { font-size: 13px; line-height: 1.7; color: var(--muted); font-weight: 300; }
  </style>
</head>
<body>
  <div class="global-sky-background" aria-hidden="true"></div>
  <div class="global-sky-overlay" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>

  <!-- Header -->
  <header class="navbar" id="navbar">
    <div class="nav-container">
      <div class="nav-left-group">
        <button class="icon-btn-nav sidebar-toggle-btn" id="sidebarToggle" type="button" aria-label="Toggle Trips History">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
        </button>
        <a class="nav-brand" href="#hero">
          <span style="color: var(--gold); font-size: 16px; margin-right: 6px;">✳</span>
          <div class="brand-name-wrap">
            <span class="brand-title">Travel<strong>Brain</strong></span>
            <span class="brand-badge">AI 2.0</span>
          </div>
        </a>
      </div>
      <nav class="nav-links" id="navLinks">
        <a href="#hero" class="nav-link active">Home</a>
        <a href="#how-it-works" class="nav-link">How It Works</a>
        <a href="#journeys" class="nav-link">Journeys</a>
        <a href="#features" class="nav-link">Features</a>
        <a href="javascript:void(0)" class="nav-link" id="navNewTrip">Plan Journey</a>
        <a href="javascript:void(0)" class="nav-link" id="navSettings">API Config</a>
      </nav>
      <div class="nav-actions">
        <div class="currency-pill"><span class="currency-flag">🇮🇳</span><span class="currency-text">INR (₹)</span></div>
        <button class="status-chip" id="apiStatus" type="button"><span class="status-indicator"></span><span class="status-text">Connected</span></button>
        <button class="btn btn-nav-auth" id="navAuthBtn" type="button"><span class="auth-btn-text" id="navAuthText">Sign In</span></button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="page-content" id="conversation">
    <!-- Scene 1: Hero -->
    <section class="scene hero" id="hero">
      <div class="box">
        <div class="eyebrow">TravelBrain Journal · 01</div>
        <h1>Above the <em>ordinary.</em></h1>
        <p>A quieter kind of escape. Leave the research noise below, follow the light, and let intelligent AI agents plan your next adventure in Indian Rupees (₹).</p>
        
        <div class="search-panel-wrapper" style="margin-top: 30px;">
          <form class="aviation-search-panel" id="mainSearchForm" onsubmit="return false;" style="background: rgba(7, 28, 43, 0.65); backdrop-filter: blur(20px); border: 1px solid var(--line); border-radius: 18px; padding: 8px 12px; display: flex; gap: 12px; align-items: center;">
            <div class="search-field source-field" style="flex: 1; padding: 6px 10px;">
              <div class="field-label" style="font-size: 0.72rem; color: var(--gold); text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.08em;">Departure City</div>
              <input type="text" id="fFrom" class="field-input" value="Lucknow" style="background: transparent; border: none; color: #fff; font-size: 0.95rem; outline: none;" />
            </div>
            <div style="width: 1px; height: 32px; background: var(--line);"></div>
            <div class="search-field dest-field" style="flex: 1; padding: 6px 10px;">
              <div class="field-label" style="font-size: 0.72rem; color: var(--gold); text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.08em;">Destination</div>
              <input type="text" id="fTo" class="field-input" value="Manali" style="background: transparent; border: none; color: #fff; font-size: 0.95rem; outline: none;" />
            </div>
            <div style="width: 1px; height: 32px; background: var(--line);"></div>
            <div class="search-field duration-field" style="flex: 0.8; padding: 6px 10px;">
              <div class="field-label" style="font-size: 0.72rem; color: var(--gold); text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.08em;">Duration</div>
              <input type="text" id="fDays" class="field-input" value="7 Days" style="background: transparent; border: none; color: #fff; font-size: 0.95rem; outline: none;" />
            </div>
            <button type="button" class="btn-plan-journey" id="btnPlanJourney" style="background: var(--gold); color: #071c2b; font-weight: 700; border-radius: 12px; padding: 12px 22px; border: none; cursor: pointer; white-space: nowrap;">
              Plan My Journey →
            </button>
          </form>
        </div>

        <div class="cue">Scroll to open</div>
      </div>
    </section>

    <!-- Hidden Setup Gate & Planning Section for functionality -->
    <section class="gate" id="setupGate" hidden></section>
    <div class="planning-section" id="planningSection" hidden>
      <div class="section-container">
        <button id="collapsePlanBtn">Back</button>
        <div class="messages" id="messages"></div>
        <form class="composer" id="composer"><textarea id="input"></textarea><button id="sendBtn"></button></form>
      </div>
    </div>

    <!-- Second Page Wrap -->
    <div class="second-page-wrap" id="secondPage">
      <!-- Scene 2: How It Works -->
      <section class="scene" id="how-it-works">
        <div class="box wide">
          <div class="eyebrow">Aviation Workflow · 02</div>
          <h2>Autonomous <em>multi-agent intelligence.</em></h2>
          <p>Tell us where. Discrete LangGraph agents query live flights, boutique stays, and meteorology before you reach the runway.</p>
          <div class="cards">
            <div class="card">
              <span style="font: 700 11px var(--font-mono); color: var(--gold); margin-bottom: 12px; display: block;">01 / INTENT</span>
              <b>Intelligent Route Input</b>
              <span>Specify departure city, destination and duration. Natural language intent parsing detects budget and pace.</span>
            </div>
            <div class="card">
              <span style="font: 700 11px var(--font-mono); color: var(--gold); margin-bottom: 12px; display: block;">02 / SWARM</span>
              <b>Multi-Agent Swarm</b>
              <span>Parallel flight, stay, and weather agents query verified live data in real time with INR tariffs.</span>
            </div>
            <div class="card">
              <span style="font: 700 11px var(--font-mono); color: var(--gold); margin-bottom: 12px; display: block;">03 / AUDIT</span>
              <b>Verified Dossier</b>
              <span>Anti-hallucination critic audits geography, timing, and generates comprehensive INR breakdowns.</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Scene 3: Journeys -->
      <section id="journeys">
        <div class="scene">
          <div class="box">
            <span class="place">Alpine Escape · Manali &amp; Kashmir</span>
            <h2>Chase the <em>first light.</em></h2>
            <p>Depart at dawn and land beside glacier-fed lakes before the valley wakes.</p>
          </div>
        </div>
        <div class="scene">
          <div class="box">
            <span class="place">Coastal Tide · Goa &amp; Kerala</span>
            <h2>Salt air, <em>quiet runways.</em></h2>
            <p>Skip the terminal. Step off the aircraft and straight into the tide.</p>
          </div>
        </div>
        <div class="scene">
          <div class="box">
            <span class="place">Desert Heritage · Rajasthan</span>
            <h2>Golden hour, <em>all day.</em></h2>
            <p>Cross open horizons while the royal forts and dunes turn amber beneath the wing.</p>
          </div>
        </div>
      </section>

      <!-- Scene 4: Features -->
      <section class="scene" id="features">
        <div class="box wide">
          <div class="eyebrow">Platform Features · 03</div>
          <h2>Three cabins. <em>One calm.</em></h2>
          <p>Pick the room you want to cross the sky in.</p>
          <div class="cards">
            <div class="card">
              <b>Lounge</b>
              <span>Stateful multi-agent architecture coordinating flights, stays, and localized climate.</span>
            </div>
            <div class="card">
              <b>Studio</b>
              <span>A dedicated Anti-Hallucination Critic audit at 35,000 feet ensuring complete itinerary accuracy.</span>
            </div>
            <div class="card">
              <b>Retreat</b>
              <span>Direct INR (₹) tariffs, seamless PDF exports, and verified pricing for peace of mind.</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Scene 5: Ready to Fly -->
      <section class="scene end" id="contact">
        <div class="box">
          <div class="eyebrow">Ready to Fly · 04</div>
          <h2>Ready to <em>explore again.</em></h2>
          <p>Share your dates and destination and our autonomous agent swarm will plan the rest.</p>
          <a class="btn" href="#hero" style="display: inline-block; margin-top: 30px; padding: 16px 32px; border-radius: 99px; background: var(--gold); color: #071c2b; font-weight: 700; text-decoration: none;">Plan a journey</a>
          <div class="foot" style="margin-top: 48px; display: flex; gap: 24px; font-size: 12px; font-family: var(--font-mono); color: var(--muted);">
            <a href="#hero">Home</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#journeys">Journeys</a>
            <a href="#features">Features</a>
            <a href="#hero">Back to top</a>
          </div>
        </div>
      </section>
    </div>
  </main>

  <!-- Aviation HUD -->
  <footer class="hud" id="aviationHud">
    <div class="meta">
      <div class="mi"><span class="ml">Flight no.</span><span class="mv">TB—001 / AI</span></div>
      <div class="mi"><span class="ml">Status</span><span class="mv"><i class="live"></i><span id="st">Boarding</span></span></div>
      <div class="mi"><span class="ml">Altitude</span><span class="mv" id="alt">0 ft</span></div>
      <div class="mi"><span class="ml">Speed</span><span class="mv" id="spd">M 0.00</span></div>
    </div>
    <div class="ctrl">
      <span>Flight Progress</span>
      <span class="bar"><i id="bar"></i></span>
      <span id="pct">00%</span>
      <a class="up" href="#hero" id="hudScrollUp" aria-label="Replay from the start">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>
      </a>
    </div>
  </footer>

  <script>
    // Aether scroll controller
    (function() {
      const H = window.innerHeight;
      const scenes = [...document.querySelectorAll('.scene .box')];
      const root = document.documentElement;
      const ease = t => t * t * (3 - 2 * t);
      const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
      const alt = p => 35000 * (p < .14 ? ease(p / .14) : p < .78 ? 1 : 1 - ease((p - .78) / .22));
      const status = p => p < .03 ? 'Boarding' : p < .16 ? 'Climbing' : p < .78 ? 'Cruising' : p < .96 ? 'Descending' : 'Landed';

      function onScroll() {
        const max = root.scrollHeight - window.innerHeight;
        const p = max > 0 ? clamp(window.scrollY / max) : 0;
        
        // Scene box opacity and translate
        for (const el of scenes) {
          const r = el.parentElement.getBoundingClientRect();
          const d = (r.top + r.height / 2 - H / 2) / H;
          const o = clamp(1 - (Math.abs(d) - 0.12) / 0.4);
          el.style.opacity = o;
          el.style.transform = `translate3d(0, ${d * 36}px, 0)`;
          el.style.pointerEvents = o > 0.4 ? 'auto' : 'none';
        }

        // HUD updates
        const al = Math.round(alt(p) / 100) * 100;
        document.getElementById('alt').textContent = al.toLocaleString('en-US') + ' ft';
        document.getElementById('spd').textContent = 'M ' + (al ? (0.4 + 0.45 * al / 35000).toFixed(2) : '0.00');
        document.getElementById('st').textContent = status(p);
        document.getElementById('bar').style.width = p * 100 + '%';
        document.getElementById('pct').textContent = String(Math.round(p * 100)).padStart(2, '0') + '%';
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    })();
  </script>
</body>
</html>
"""

Path("dist/test_fusion_render.html").write_text(test_html, encoding="utf-8")
print("dist/test_fusion_render.html created!")
