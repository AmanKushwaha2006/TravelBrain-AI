/**
 * TravelBrain — Aviation engine (Three.js + GSAP ScrollTrigger)
 * One animation system: ScrollTrigger scrubs a flight-state object along a
 * U-shaped path; the render loop adds turbulence, mouse parallax and mobile fit.
 * Public API kept for app.js: Aviation3D.init(id), Aviation3D.setScrollProgress().
 */
(function (w, d) {
  "use strict";

  var A = {
    renderer: null, scene: null, camera: null, plane: null,
    base: 1, hold: 0, t0: 0,
    clock: null,
    mouse: { x: 0, y: 0, tx: 0, ty: 0 },
    // Flight state tweened by ScrollTrigger (start = hero pose)
    f: { x: 4.6, y: 3.6, z: 0, rx: 0.05, ry: -0.55, rz: 0.08, s: 1 },

    init: function (id) {
      if (this.renderer) return;
      var box = this.container = d.getElementById(id);
      if (!box) return;
      if (!w.THREE || !THREE.GLTFLoader) return this.renderFallback();
      try {
        var probe = d.createElement("canvas");
        if (!(probe.getContext("webgl") || probe.getContext("experimental-webgl"))) return this.renderFallback();
      } catch (e) { return this.renderFallback(); }

      var W = box.clientWidth || w.innerWidth, H = box.clientHeight || w.innerHeight;
      this.clock = new THREE.Clock();
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 500);
      this.camera.position.set(0, 1.8, 25);
      this.camera.lookAt(0, 1.6, 0);

      var r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      r.setPixelRatio(Math.min(w.devicePixelRatio, w.innerWidth < 768 ? 1.5 : 2));
      r.setSize(W, H);
      r.toneMapping = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.08;
      r.outputEncoding = THREE.sRGBEncoding;
      r.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
      box.innerHTML = "";
      box.appendChild(r.domElement);

      var scene = this.scene;
      scene.add(new THREE.AmbientLight(0xffffff, 1.25));
      [[0xffdfb0, 2.7, -25, 20, 16],   // golden sun key
       [0xff9944, 1.4, 0, -18, 12],    // warm cloud bounce
       [0x70a8d8, 0.9, 10, 25, 5],     // cool sky fill
       [0xfff0dd, 1.15, 22, 6, -15]    // rim highlight
      ].forEach(function (l) {
        var light = new THREE.DirectionalLight(l[0], l[1]);
        light.position.set(l[2], l[3], l[4]);
        scene.add(light);
      });

      this.load(0);
      this.bindScroll();
      this.bindEvents();
      this.loop();
    },

    load: function (i) {
      var self = this, urls = ["/static/models/A350.glb", "/static/models/A320.glb"];
      if (i >= urls.length) return this.renderFallback();
      new THREE.GLTFLoader().load(urls[i], function (g) {
        var root = g.scene;
        if (i) root.rotation.x = -Math.PI / 2; // A320 export is Z-up
        root.traverse(function (c) {
          if (!c.isMesh) return;
          c.material.side = THREE.DoubleSide;
          if (c.material.roughness !== undefined) { c.material.roughness = 0.22; c.material.metalness = 0.42; }
        });
        var wrap = new THREE.Group();
        wrap.add(root);
        var bb = new THREE.Box3().setFromObject(wrap), c = new THREE.Vector3(), s = new THREE.Vector3();
        bb.getCenter(c); bb.getSize(s);
        root.position.sub(c);
        self.base = 11.8 / Math.max(s.x, s.y, s.z);
        wrap.scale.setScalar(self.base);
        self.scene.add(wrap);
        self.plane = wrap;
        self.t0 = self.clock.getElapsedTime();
      }, undefined, function () { self.load(i + 1); });
    },

    // Right → sweeping down-left → bottom → back up right → off toward the horizon
    bindScroll: function () {
      var g = w.gsap, f = this.f;
      if (!g || !w.ScrollTrigger) return;
      g.registerPlugin(w.ScrollTrigger);
      g.timeline({
        defaults: { ease: "sine.inOut" },
        scrollTrigger: { trigger: d.documentElement, start: "top top", end: "bottom bottom", scrub: 1.2 }
      })
        .to(f, { x: 0.4,  y: 0.6,  z: -2, rx: 0.10,  ry: -0.15, rz: -0.20, s: 0.80, duration: 1 })
        .to(f, { x: -4.4, y: -1.2, z: -3, rx: 0.02,  ry: 0.30,  rz: -0.05, s: 0.68, duration: 1 })
        .to(f, { x: 0.6,  y: -1.8, z: -4, rx: -0.05, ry: -0.20, rz: 0.12,  s: 0.62, duration: 1 })
        .to(f, { x: 5.2,  y: 0.4,  z: -5, rx: -0.08, ry: -0.60, rz: 0.16,  s: 0.55, duration: 1 })
        .to(f, { x: 8.8,  y: 4.6,  z: -9, rx: 0.04,  ry: -0.55, rz: 0.05,  s: 0.32, duration: 1 });

      // Smoothly fade out aeroplane canvas before footer enters viewport
      var canvasWrap = d.getElementById("canvasContainer") || d.getElementById("threeCanvas");
      if (canvasWrap && d.querySelector(".site-footer")) {
        g.to(canvasWrap, {
          opacity: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".site-footer",
            start: "top 95%",
            end: "top 65%",
            scrub: true
          }
        });
      }
    },

    bindEvents: function () {
      var self = this, m = this.mouse;
      w.addEventListener("mousemove", function (e) {
        m.tx = (e.clientX / w.innerWidth) * 2 - 1;
        m.ty = -(e.clientY / w.innerHeight) * 2 + 1;
      }, { passive: true });
      w.addEventListener("resize", function () {
        var W = self.renderer.domElement.parentNode.clientWidth || w.innerWidth;
        var H = self.renderer.domElement.parentNode.clientHeight || w.innerHeight;
        self.camera.aspect = W / H;
        self.camera.updateProjectionMatrix();
        self.renderer.setSize(W, H);
      }, { passive: true });
    },

    setScrollProgress: function () {}, // ScrollTrigger owns progress now (app.js still calls this)

    loop: function () {
      var self = this;
      (function tick() {
        requestAnimationFrame(tick);
        var t = self.clock.getElapsedTime(), m = self.mouse, p = self.plane;
        m.x += (m.tx - m.x) * 0.05;
        m.y += (m.ty - m.y) * 0.05;

        if (p) {
          var f = self.f, mob = w.innerWidth < 768;
          var fit = Math.min(1, self.camera.aspect / 1.4);            // keep wingspan on narrow screens
          var planning = d.body.classList.contains("planning-active") ? 1 : 0;
          self.hold += (planning - self.hold) * 0.06;                 // park in the corner while agents work
          var h = self.hold;
          var k = Math.min((t - self.t0) / 2.2, 1); k = 1 - Math.pow(1 - k, 3); // fly-in

          var x = (f.x + (6 - f.x) * h) * (mob ? 0.4 : 1) - (1 - k) * 24;
          var y = f.y + (4.8 - f.y) * h + (mob ? 1.2 : 0);
          var s = (f.s + (0.4 - f.s) * h) * fit;

          p.position.set(x + m.x, y + Math.sin(t * 1.6) * 0.12 + m.y * 0.5, f.z);
          p.rotation.set(
            f.rx - m.y * 0.08 + Math.sin(t * 1.4) * 0.016,
            f.ry + m.x * 0.08,
            f.rz - m.x * 0.12 + Math.cos(t * 1.1) * 0.024
          );
          p.scale.setScalar(self.base * s);
        }
        self.renderer.render(self.scene, self.camera);
      })();
    },

    // No WebGL / model failed: static SVG airliner (same fallback as before)
    renderFallback: function () {
      if (!this.container || this.container.querySelector(".aviation-fallback")) return;
      var f = d.createElement("div");
      f.className = "aviation-fallback";
      f.innerHTML = '<div class="airplane-svg-wrapper" style="position:absolute;top:32%;left:60%;width:min(560px,80vw);transform:translate(-50%,-50%);animation:floatAirplane 5s ease-in-out infinite"><svg class="airplane-svg" viewBox="0 0 1024 400" fill="none"><path d="M120 180 C280 180 580 160 840 180 C880 182 930 190 900 205 C850 215 540 220 120 208 Z" fill="#F4F8FC"/><path d="M460 178 L310 50 L380 50 L580 176 Z" fill="#E2EDF7"/><path d="M480 205 L360 340 L430 340 L600 205 Z" fill="#8CA4BC"/><path d="M305 45 L320 15 L335 18 L320 50 Z" fill="#55B8E8"/><path d="M130 182 L70 65 L120 65 L210 182 Z" fill="#071B33"/><rect x="510" y="220" width="130" height="42" rx="18" fill="#071B33"/></svg></div>';
      this.container.appendChild(f);
    }
  };

  w.Aviation3D = A;
  var go = function () { A.init("heroCanvasContainer"); };
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", go); else go();
})(window, document);
