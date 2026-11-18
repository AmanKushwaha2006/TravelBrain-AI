with open('frontend/static/js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# Define Aether Scroll Engine function
aether_engine_code = """
  /* ============================================================
     Aether Luxury Scroll & Telemetry Engine
     ============================================================ */
  function initAetherScrollEngine() {
    var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var clamp = function (v, a, b) { return Math.min(b !== undefined ? b : 1, Math.max(a !== undefined ? a : 0, v)); };
    var lerp = function (a, b, t) { return a + (b - a) * t; };
    var ease = function (t) { return t * t * (3 - 2 * t); };
    var hex = function (h) {
      return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); });
    };

    // Sky shifts from dawn to midday to golden hour to dusk to night as you scroll
    var SKY = [
      [0, '#0a2a42', '#6f9fb8'],
      [0.28, '#1d5b86', '#a9d0e3'],
      [0.58, '#0f3a5c', '#e7c999'],
      [0.82, '#1a1a3a', '#c9806a'],
      [1.0, '#071c2b', '#3b4f6b']
    ].map(function (k) { return [k[0], hex(k[1]), hex(k[2])]; });

    function seg(arr, p) {
      var i = 0;
      while (i < arr.length - 2 && p > arr[i + 1][0]) i++;
      var a = arr[i], b = arr[i + 1];
      return [a, b, ease(clamp((p - a[0]) / (b[0] - a[0])))];
    }

    // Procedural atmospheric clouds
    var cl = document.getElementById('clouds');
    var C = [];
    if (cl && cl.children.length === 0) {
      var seed = 7;
      var rnd = function () {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      for (var ci = 0; ci < 16; ci++) {
        var w = 180 + rnd() * 360;
        var d = 0.25 + rnd() * 1.5;
        var e = document.createElement('i');
        e.style.cssText = 'width:' + w + 'px;height:' + (w * 0.32) + 'px;top:' + (8 + rnd() * 84) + '%;opacity:' + (0.12 + rnd() * 0.28 * d / 1.5) + ';';
        cl.appendChild(e);
        C.push({ e: e, w: w, d: d, x: rnd() * 1800 });
      }
    }

    var sun = document.getElementById('sun');
    var root = document.documentElement;
    var scenes = Array.prototype.slice.call(document.querySelectorAll('.scene .box'));
    var secs = Array.prototype.slice.call(document.querySelectorAll('main [id]'));
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));

    var alt = function (p) {
      return 35000 * (p < 0.14 ? ease(p / 0.14) : p < 0.78 ? 1 : 1 - ease((p - 0.78) / 0.22));
    };
    var status = function (p) {
      return p < 0.03 ? 'Boarding' : p < 0.14 ? 'Climbing' : p < 0.78 ? 'Cruising' : p < 0.97 ? 'Descending' : 'Landed';
    };

    var sp = 0, W = window.innerWidth, H = window.innerHeight;
    var size = function () {
      W = window.innerWidth;
      H = window.innerHeight;
    };
    window.addEventListener('resize', size);

    var altEl = document.getElementById('alt');
    var spdEl = document.getElementById('spd');
    var stEl = document.getElementById('st');
    var barEl = document.getElementById('bar');
    var pctEl = document.getElementById('pct');

    function frame(t) {
      var max = root.scrollHeight - H;
      var p = max > 0 ? clamp(window.scrollY / max) : 0;
      sp = rm ? p : sp + (p - sp) * 0.075;

      // Update Sky colors
      var s = seg(SKY, sp);
      var a = s[0], b = s[1], k = s[2];
      var mix = function (idx) {
        return a[idx].map(function (v, j) {
          return Math.round(lerp(v, b[idx][j], k));
        }).join(',');
      };
      root.style.setProperty('--sky-top', 'rgb(' + mix(1) + ')');
      root.style.setProperty('--sky-bot', 'rgb(' + mix(2) + ')');

      // Update Sun position
      if (sun) {
        sun.style.transform = 'translate3d(' + (lerp(0.72, 0.3, sp) * W) + 'px,' + (lerp(0.22, 0.72, sp) * H) + 'px,0)';
      }

      // Parallax drifting clouds
      var tt = rm ? 0 : t * 0.01;
      for (var i = 0; i < C.length; i++) {
        var c = C[i];
        var span = W + c.w * 2;
        var x = (((c.x - (sp * 1400 + tt) * c.d) % span + span) % span) - c.w;
        c.e.style.transform = 'translate3d(' + x + 'px,0,0)';
      }

      // Choreograph 3D Flight Waypoint Spline
      if (window.Aviation3D && typeof window.Aviation3D.setScrollProgress === 'function') {
        window.Aviation3D.setScrollProgress(sp);
      }

      // Scene boxes opacity & distance-from-center parallax
      for (var si = 0; si < scenes.length; si++) {
        var el = scenes[si];
        var parent = el.parentElement;
        if (!parent) continue;
        var r = parent.getBoundingClientRect();
        var d = (r.top + r.height / 2 - H / 2) / H;
        var o = clamp(1 - (Math.abs(d) - 0.12) / 0.4);
        el.style.opacity = o;
        el.style.transform = 'translate3d(0,' + (d * 44) + 'px,0)';
        el.style.pointerEvents = o > 0.35 ? 'auto' : 'none';
      }

      // Real-Time HUD Telemetry
      var al = Math.round(alt(p) / 100) * 100;
      if (altEl) altEl.textContent = al.toLocaleString('en-US') + ' ft';
      if (spdEl) spdEl.textContent = 'M ' + (al ? (0.4 + 0.45 * al / 35000).toFixed(2) : '0.00');
      if (stEl) stEl.textContent = status(p);
      if (barEl) barEl.style.width = (p * 100) + '%';
      if (pctEl) pctEl.textContent = String(Math.round(p * 100)).padStart(2, '0') + '%';

      // Active nav link highlight
      var cur = secs[0];
      for (var sidx = 0; sidx < secs.length; sidx++) {
        if (secs[sidx].getBoundingClientRect().top <= H * 0.5) {
          cur = secs[sidx];
        }
      }
      if (cur) {
        links.forEach(function (l) {
          l.classList.toggle('on', l.getAttribute('href') === '#' + cur.id);
        });
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }
"""

# Replace in app.js
target_str = "/* ---------------- Initialization ---------------- */"
if target_str in app_js:
    # Check if initAetherScrollEngine already in app_js
    if 'initAetherScrollEngine' not in app_js:
        app_js = app_js.replace(
            target_str,
            aether_engine_code + "\n  " + target_str + "\n\n  initAetherScrollEngine();"
        )
        print("Inserted initAetherScrollEngine into app.js")
    else:
        print("initAetherScrollEngine already present in app.js")

# Add planning-active toggling
if 'document.body.classList.add("planning-active")' not in app_js:
    app_js = app_js.replace(
        'if (planningSection) planningSection.hidden = false;\n    renderUser(message);',
        'if (planningSection) planningSection.hidden = false;\n    document.body.classList.add("planning-active");\n    renderUser(message);'
    )
    app_js = app_js.replace(
        'if (collapsePlanBtn) {\n    collapsePlanBtn.addEventListener("click", function () {\n      if (hero) hero.scrollIntoView({ behavior: "smooth" });\n    });\n  }',
        'if (collapsePlanBtn) {\n    collapsePlanBtn.addEventListener("click", function () {\n      document.body.classList.remove("planning-active");\n      if (hero) hero.scrollIntoView({ behavior: "smooth" });\n    });\n  }'
    )
    app_js = app_js.replace(
        'if (planningSection) planningSection.hidden = true;\n    if (hero) hero.scrollIntoView({ behavior: "smooth" });',
        'if (planningSection) planningSection.hidden = true;\n    document.body.classList.remove("planning-active");\n    if (hero) hero.scrollIntoView({ behavior: "smooth" });'
    )
    print("Added planning-active toggles in app.js")

with open('frontend/static/js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

print("Updated frontend/static/js/app.js successfully!")
