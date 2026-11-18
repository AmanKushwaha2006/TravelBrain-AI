with open('dist/test_fusion_render.html', 'r', encoding='utf-8') as f:
    h = f.read()

# Replace the scroll listener in test_fusion_render.html with the full Aether rAF loop
old_script = """    // Aether scroll controller
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
          const o = clamp(1 - (Math.abs(d) - 0.25) / 0.65, 0.2, 1);
          el.style.opacity = o;
          el.style.transform = `translate3d(0, ${d * 36}px, 0)`;
          el.style.pointerEvents = o > 0.25 ? 'auto' : 'none';
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
    })();"""

new_script = """    // Aether continuous rAF scroll engine
    (function() {
      let H = window.innerHeight;
      window.addEventListener('resize', () => { H = window.innerHeight; });
      const scenes = [...document.querySelectorAll('.scene .box')];
      const root = document.documentElement;
      const ease = t => t * t * (3 - 2 * t);
      const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
      const alt = p => 35000 * (p < .14 ? ease(p / .14) : p < .78 ? 1 : 1 - ease((p - .78) / .22));
      const status = p => p < .03 ? 'Boarding' : p < .16 ? 'Climbing' : p < .78 ? 'Cruising' : p < .96 ? 'Descending' : 'Landed';
      let sp = 0;

      function frame() {
        const max = root.scrollHeight - H;
        const p = max > 0 ? clamp(window.scrollY / max) : 0;
        sp += (p - sp) * 0.15;
        
        for (const el of scenes) {
          const r = el.parentElement.getBoundingClientRect();
          const d = (r.top + r.height / 2 - H / 2) / H;
          const o = clamp(1 - (Math.abs(d) - 0.25) / 0.65, 0.25, 1);
          el.style.opacity = o;
          el.style.transform = `translate3d(0, ${d * 32}px, 0)`;
          el.style.pointerEvents = o > 0.3 ? 'auto' : 'none';
        }

        const al = Math.round(alt(sp) / 100) * 100;
        const altEl = document.getElementById('alt');
        const spdEl = document.getElementById('spd');
        const stEl = document.getElementById('st');
        const barEl = document.getElementById('bar');
        const pctEl = document.getElementById('pct');

        if (altEl) altEl.textContent = al.toLocaleString('en-US') + ' ft';
        if (spdEl) spdEl.textContent = 'M ' + (al ? (0.4 + 0.45 * al / 35000).toFixed(2) : '0.00');
        if (stEl) stEl.textContent = status(sp);
        if (barEl) barEl.style.width = (sp * 100) + '%';
        if (pctEl) pctEl.textContent = String(Math.round(sp * 100)).padStart(2, '0') + '%';

        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    })();"""

if old_script in h:
    h = h.replace(old_script, new_script)
    print("Replaced with continuous rAF engine")
else:
    print("Warning: old_script not matched exactly, performing regex replacement")
    import re
    h = re.sub(r'// Aether scroll controller.*?</script>', new_script + '\n  </script>', h, flags=re.DOTALL)

with open('dist/test_fusion_render.html', 'w', encoding='utf-8') as f:
    f.write(h)

print("Updated dist/test_fusion_render.html")
