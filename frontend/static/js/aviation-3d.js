/**
 * TravelBrain AI � Ultra-Realistic Cinematic Aviation Engine
 * Photorealistic Airbus A350 Commercial Passenger Airliner
 * Cinematic Sunset Cloudscape, Physical Aircraft Dynamics, Navigation Lights & Interactive Cameras
 */
(function (window, document) {
  "use strict";

  var Aviation3D = {
    renderer: null,
    scene: null,
    camera: null,
    airplane: null,
    airplaneRoot: null,
    strobeLights: [],
    beaconLights: [],
    beaconTimer: 0,
    strobeTimer: 0,

    skyBackdrop: null,

    // Flight Dynamics State
    currentCameraMode: "front",
    directorTimer: null,
    introTimer: 0,
    introDuration: 2.2,

    // Target Camera Positions & Focus
    cameraModes: {
      front: {
        camPos: new THREE.Vector3(0, 1.8, 25),
        camLook: new THREE.Vector3(0, 1.6, 0),
        planeRot: { x: 0.03, y: -0.52, z: 0.07 },
        planePos: { x: 0.2, y: 6.4, z: 0 },
        fov: 36
      },
      side: {
        camPos: new THREE.Vector3(0, 1.8, 25),
        camLook: new THREE.Vector3(0, 1.6, 0),
        planeRot: { x: 0.02, y: 0.0, z: 0.04 },
        planePos: { x: 0.2, y: 6.4, z: 0 },
        fov: 36
      },
      wing: {
        camPos: new THREE.Vector3(-4.5, 1.6, 24),
        camLook: new THREE.Vector3(1.2, 2.8, 0),
        planeRot: { x: -0.02, y: 0.65, z: -0.06 },
        planePos: { x: 0.5, y: 6.4, z: 0 },
        fov: 38
      }
    },

    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    scrollProgress: 0,
    container: null,
    canvas: null,
    animFrameId: null,
    clock: null,
    isRunning: false,

    init: function (containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      // Prevent duplicate canvas creation
      if (this.renderer && this.renderer.domElement) {
        if (this.container.contains(this.renderer.domElement)) {
          return;
        }
      }

      // Check Three.js availability
      if (typeof window.THREE === "undefined") {
        console.warn("Three.js not loaded. Activating fallback.");
        this.renderFallback();
        return;
      }

      // Check WebGL support
      try {
        var testCanvas = document.createElement("canvas");
        var gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
        if (!gl) {
          this.renderFallback();
          return;
        }
      } catch (e) {
        this.renderFallback();
        return;
      }

      try {
        this.clock = new THREE.Clock();
        this.setupScene();
        this.setupLighting();
        this.buildAtmosphereAndSky();
        this.loadAircraftModel();
        this.setupEvents();
        this.setupCameraControls();
        this.startLoop();
      } catch (err) {
        console.error("Aviation3D initialization error:", err);
        this.renderFallback();
      }
    },

    setupScene: function () {
      var width = this.container.clientWidth || window.innerWidth;
      var height = this.container.clientHeight || window.innerHeight;

      this.scene = new THREE.Scene();

      var defaultCam = this.cameraModes.front;
      this.camera = new THREE.PerspectiveCamera(defaultCam.fov, width / height, 0.1, 1500);
      this.camera.position.copy(defaultCam.camPos);
      this.camera.lookAt(defaultCam.camLook);

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.08;
      this.renderer.outputEncoding = THREE.sRGBEncoding;

      this.canvas = this.renderer.domElement;
      this.canvas.className = "aviation-canvas";
      this.canvas.style.position = "absolute";
      this.canvas.style.top = "0";
      this.canvas.style.left = "0";
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      this.canvas.style.pointerEvents = "none";
      this.canvas.style.zIndex = "1";

      this.container.innerHTML = "";
      this.container.appendChild(this.canvas);
    },

    setupLighting: function () {
      // 1. Ambient Fill Light (crisp balanced base)
      var ambient = new THREE.AmbientLight(0xffffff, 1.25);
      this.scene.add(ambient);

      // 2. Primary Golden Sun Key (upper-left sunset sun matching background plate)
      var sunLight = new THREE.DirectionalLight(0xffdfb0, 2.7);
      sunLight.position.set(-25, 20, 16);
      this.scene.add(sunLight);

      // 3. Warm Sunset Cloud Bounce Light (warm light reflected from the sea of clouds below)
      var cloudBounce = new THREE.DirectionalLight(0xff9944, 1.4);
      cloudBounce.position.set(0, -18, 12);
      this.scene.add(cloudBounce);

      // 4. Cool Atmospheric Sky Fill
      var skyFill = new THREE.DirectionalLight(0x70a8d8, 0.9);
      skyFill.position.set(10, 25, 5);
      this.scene.add(skyFill);

      // 5. Specular Rim Highlight (catches polished fuselage & wing edges)
      var rimLight = new THREE.DirectionalLight(0xfff0dd, 1.15);
      rimLight.position.set(22, 6, -15);
      this.scene.add(rimLight);
    },

    buildAtmosphereAndSky: function () {
      var self = this;
      var textureLoader = new THREE.TextureLoader();

      textureLoader.load(
        "/static/img/sky-sunset-bg.jpg",
        function (texture) {
          texture.encoding = THREE.sRGBEncoding;
          var bgGeo = new THREE.PlaneGeometry(125, 70);
          var bgMat = new THREE.MeshBasicMaterial({
            map: texture,
            depthWrite: false
          });
          var bgMesh = new THREE.Mesh(bgGeo, bgMat);
          bgMesh.position.set(0, 2, -45);
          self.scene.add(bgMesh);
          self.skyBackdrop = bgMesh;
        },
        undefined,
        function () {
          // Dynamic shader sky gradient fallback
          var bgGeo = new THREE.PlaneGeometry(125, 70);
          var bgMat = new THREE.ShaderMaterial({
            uniforms: {
              colorTop: { value: new THREE.Color(0x0c2038) },
              colorMid: { value: new THREE.Color(0x274e78) },
              colorSunset: { value: new THREE.Color(0xffaf66) },
              colorSunGlow: { value: new THREE.Color(0xffe4b5) }
            },
            vertexShader: [
              "varying vec2 vUv;",
              "void main() {",
              "  vUv = uv;",
              "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
              "}"
            ].join("\n"),
            fragmentShader: [
              "uniform vec3 colorTop;",
              "uniform vec3 colorMid;",
              "uniform vec3 colorSunset;",
              "uniform vec3 colorSunGlow;",
              "varying vec2 vUv;",
              "void main() {",
              "  vec3 c = mix(colorMid, colorTop, smoothstep(0.4, 1.0, vUv.y));",
              "  float sun = exp(-length(vUv - vec2(0.22, 0.76)) * 4.2);",
              "  c = mix(c, colorSunset, smoothstep(0.08, 0.45, vUv.y) * (1.0 - smoothstep(0.45, 0.85, vUv.y)));",
              "  c += colorSunGlow * sun * 1.6;",
              "  gl_FragColor = vec4(c, 1.0);",
              "}"
            ].join("\n"),
            depthWrite: false
          });
          var bgMesh = new THREE.Mesh(bgGeo, bgMat);
          bgMesh.position.set(0, 2, -45);
          self.scene.add(bgMesh);
          self.skyBackdrop = bgMesh;
        }
      );
    },

    loadAircraftModel: function () {
      var self = this;
      var loader = new THREE.GLTFLoader();

      // Load ultra-detailed Airbus A350 commercial airliner
      loader.load(
        "/static/models/A350.glb",
        function (gltf) {
          var root = gltf.scene;

          // Enable double-sided PBR materials & high-specular finish
          root.traverse(function (child) {
            if (child.isMesh) {
              child.material.side = THREE.DoubleSide;
              if (child.material.roughness !== undefined) {
                child.material.roughness = 0.22;
                child.material.metalness = 0.42;
              }
            }
          });

          // Outer wrapper group for smooth animation, banking & positioning
          var wrapper = new THREE.Group();
          wrapper.add(root);

          // Center root inside wrapper precisely at its geometric centroid
          var box = new THREE.Box3().setFromObject(wrapper);
          var center = new THREE.Vector3();
          box.getCenter(center);
          root.position.sub(center);

          // Scale model so wingspan fits screen width gracefully (~15.2 units)
          var size = new THREE.Vector3();
          box.getSize(size);
          var maxDim = Math.max(size.x, size.y, size.z);
          var scaleFactor = 15.2 / maxDim;
          wrapper.scale.set(scaleFactor, scaleFactor, scaleFactor);

          // Attach Aviation Navigation Strobes & Beacons
          self.attachAviationLights(wrapper);

          // Initial placement & rotation
          var defMode = self.cameraModes.front;
          wrapper.rotation.set(defMode.planeRot.x, defMode.planeRot.y, defMode.planeRot.z);
          wrapper.position.set(-22, defMode.planePos.y, defMode.planePos.z);

          self.scene.add(wrapper);
          self.airplane = wrapper;
          self.airplaneRoot = root;
          self.introTimer = 0;
        },
        undefined,
        function (err) {
          console.error("A350 model loading failed, falling back to A320:", err);
          self.loadFallbackA320();
        }
      );
    },

    loadFallbackA320: function () {
      var self = this;
      var loader = new THREE.GLTFLoader();

      loader.load(
        "/static/models/A320.glb",
        function (gltf) {
          var root = gltf.scene;
          root.traverse(function (child) {
            if (child.isMesh) {
              child.material.side = THREE.DoubleSide;
            }
          });

          var wrapper = new THREE.Group();
          wrapper.add(root);

          var box = new THREE.Box3().setFromObject(wrapper);
          var center = new THREE.Vector3();
          box.getCenter(center);
          root.position.sub(center);

          var size = new THREE.Vector3();
          box.getSize(size);
          var maxDim = Math.max(size.x, size.y, size.z);
          var s = 15.2 / maxDim;
          wrapper.scale.set(s, s, s);

          wrapper.rotation.set(-Math.PI / 2 + 0.08, 0, 0.06);
          wrapper.position.set(0.5, 3.2, 0);

          self.scene.add(wrapper);
          self.airplane = wrapper;
          self.introTimer = 999;
        },
        undefined,
        function (e2) {
          console.error("3D models failed to load. Activating SVG fallback:", e2);
          self.renderFallback();
        }
      );
    },

    attachAviationLights: function (wrapper) {
      // 1. Port Wingtip Red Nav Light & Strobe
      var redNav = new THREE.PointLight(0xff2222, 1.8, 6);
      redNav.position.set(-7.6, 0.1, -1.8);
      wrapper.add(redNav);

      var leftStrobe = new THREE.PointLight(0xffffff, 2.8, 8);
      leftStrobe.position.set(-7.7, 0.15, -1.9);
      wrapper.add(leftStrobe);
      this.strobeLights.push(leftStrobe);

      // 2. Starboard Wingtip Green Nav Light & Strobe
      var greenNav = new THREE.PointLight(0x22ff44, 1.8, 6);
      greenNav.position.set(7.6, 0.1, -1.8);
      wrapper.add(greenNav);

      var rightStrobe = new THREE.PointLight(0xffffff, 2.8, 8);
      rightStrobe.position.set(7.7, 0.15, -1.9);
      wrapper.add(rightStrobe);
      this.strobeLights.push(rightStrobe);

      // 3. Tail Apex White Strobe
      var tailStrobe = new THREE.PointLight(0xffffff, 2.6, 10);
      tailStrobe.position.set(0, 3.4, -6.8);
      wrapper.add(tailStrobe);
      this.strobeLights.push(tailStrobe);

      // 4. Fuselage Red Anti-Collision Pulsing Beacons (Top & Belly)
      var topBeacon = new THREE.PointLight(0xff1122, 2.2, 7);
      topBeacon.position.set(0, 1.8, 0.8);
      wrapper.add(topBeacon);
      this.beaconLights.push(topBeacon);

      var bellyBeacon = new THREE.PointLight(0xff1122, 2.2, 7);
      bellyBeacon.position.set(0, -1.4, 0.8);
      wrapper.add(bellyBeacon);
      this.beaconLights.push(bellyBeacon);
    },

    setupEvents: function () {
      var self = this;

      // Mouse Parallax
      window.addEventListener("mousemove", function (e) {
        var nx = (e.clientX / window.innerWidth) * 2 - 1;
        var ny = -(e.clientY / window.innerHeight) * 2 + 1;
        self.mouse.targetX = nx;
        self.mouse.targetY = ny;
      }, { passive: true });

      // Window Resize
      window.addEventListener("resize", function () {
        self.onResize();
      }, { passive: true });

      // Scroll Depth Parallax
      window.addEventListener("scroll", function () {
        var scrollY = window.pageYOffset || document.documentElement.scrollTop;
        var heroHeight = self.container ? self.container.clientHeight : window.innerHeight;
        self.scrollProgress = Math.min(Math.max(scrollY / heroHeight, 0), 1.5);
      }, { passive: true });
    },

    onResize: function () {
      if (!this.container || !this.camera || !this.renderer) return;
      var width = this.container.clientWidth || window.innerWidth;
      var height = this.container.clientHeight || window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    },

    setupCameraControls: function () {
      var self = this;
      var modeButtons = document.querySelectorAll("[data-cam-mode]");
      if (!modeButtons.length) return;

      modeButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var mode = btn.getAttribute("data-cam-mode");
          self.switchCameraMode(mode);

          modeButtons.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
        });
      });
    },

    switchCameraMode: function (mode) {
      if (this.directorTimer) {
        clearInterval(this.directorTimer);
        this.directorTimer = null;
      }

      if (mode === "director") {
        this.startDirectorMode();
        return;
      }

      this.applyCameraMode(mode, 1.8);
    },

    applyCameraMode: function (modeKey, duration) {
      var config = this.cameraModes[modeKey];
      if (!config) return;
      this.currentCameraMode = modeKey;

      if (window.gsap && this.camera && this.airplane) {
        window.gsap.to(this.camera.position, {
          x: config.camPos.x,
          y: config.camPos.y,
          z: config.camPos.z,
          duration: duration,
          ease: "power2.inOut"
        });

        window.gsap.to(this.airplane.rotation, {
          x: config.planeRot.x,
          y: config.planeRot.y,
          z: config.planeRot.z,
          duration: duration,
          ease: "power2.inOut"
        });

        window.gsap.to(this.airplane.position, {
          x: config.planePos.x,
          y: config.planePos.y,
          z: config.planePos.z,
          duration: duration,
          ease: "power2.inOut"
        });
      } else {
        if (this.camera) this.camera.position.copy(config.camPos);
        if (this.airplane) {
          this.airplane.rotation.set(config.planeRot.x, config.planeRot.y, config.planeRot.z);
          this.airplane.position.set(config.planePos.x, config.planePos.y, config.planePos.z);
        }
      }
    },

    startDirectorMode: function () {
      var modes = ["front", "side", "wing"];
      var idx = 0;
      var self = this;
      this.applyCameraMode(modes[idx], 2.2);

      this.directorTimer = setInterval(function () {
        idx = (idx + 1) % modes.length;
        self.applyCameraMode(modes[idx], 2.4);

        var modeButtons = document.querySelectorAll("[data-cam-mode]");
        modeButtons.forEach(function (b) {
          if (b.getAttribute("data-cam-mode") === modes[idx]) {
            b.classList.add("active");
          } else if (b.getAttribute("data-cam-mode") !== "director") {
            b.classList.remove("active");
          }
        });
      }, 7500);
    },

    startLoop: function () {
      var self = this;
      this.isRunning = true;

      function render() {
        self.animFrameId = requestAnimationFrame(render);

        var delta = self.clock ? self.clock.getDelta() : 0.016;
        var elapsedTime = self.clock ? self.clock.getElapsedTime() : 0;

        // 1. Aerodynamic Mouse Smoothing
        self.mouse.x += (self.mouse.targetX - self.mouse.x) * 0.045;
        self.mouse.y += (self.mouse.targetY - self.mouse.y) * 0.045;

        // 2. Flight Dynamics & Intro Entrance
        if (self.airplane) {
          var activeConfig = self.cameraModes[self.currentCameraMode] || self.cameraModes.front;

          if (self.introTimer < self.introDuration) {
            self.introTimer += delta;
            var t = Math.min(self.introTimer / self.introDuration, 1.0);
            var ease = 1 - Math.pow(1 - t, 3); // Smooth cubic ease-out
            self.airplane.position.x = -22 + (activeConfig.planePos.x - (-22)) * ease;
            self.airplane.position.y = activeConfig.planePos.y;
          } else {
            // Turbulence and physical flight banking
            var turbulencePitch = Math.sin(elapsedTime * 1.4) * 0.016 + Math.cos(elapsedTime * 0.7) * 0.008;
            var turbulenceRoll = Math.cos(elapsedTime * 1.1) * 0.024;
            var turbulenceY = Math.sin(elapsedTime * 1.6) * 0.12;

            self.airplane.position.y = activeConfig.planePos.y + turbulenceY + self.mouse.y * 0.7 + self.scrollProgress * 2.8;
            self.airplane.position.x = activeConfig.planePos.x + self.mouse.x * 1.4 - self.scrollProgress * 1.8;

            self.airplane.rotation.z = activeConfig.planeRot.z - self.mouse.x * 0.14 + turbulenceRoll;
            self.airplane.rotation.x = activeConfig.planeRot.x - self.mouse.y * 0.08 + turbulencePitch;
            self.airplane.rotation.y = activeConfig.planeRot.y + self.mouse.x * 0.07;
          }
        }

        // 3. Strobe & Beacon Flash Animation
        self.strobeTimer += delta;
        var isStrobeFlash = Math.sin(self.strobeTimer * 7.0) > 0.84;
        for (var s = 0; s < self.strobeLights.length; s++) {
          self.strobeLights[s].intensity = isStrobeFlash ? 3.2 : 0.3;
        }

        self.beaconTimer += delta;
        var isBeaconFlash = Math.sin(self.beaconTimer * 4.4) > 0.76;
        for (var b = 0; b < self.beaconLights.length; b++) {
          self.beaconLights[b].intensity = isBeaconFlash ? 2.4 : 0.2;
        }

        // 4. Subtle Backdrop Parallax
        if (self.skyBackdrop) {
          self.skyBackdrop.position.x = -self.mouse.x * 1.1;
          self.skyBackdrop.position.y = 2.0 - self.mouse.y * 0.6;
        }

        // 5. Camera LookAt
        var activeMode = self.cameraModes[self.currentCameraMode] || self.cameraModes.front;
        self.camera.lookAt(
          activeMode.camLook.x + self.mouse.x * 0.25,
          activeMode.camLook.y + self.mouse.y * 0.18,
          activeMode.camLook.z
        );

        self.renderer.render(self.scene, self.camera);
      }

      this.onResize();
      render();
    },

    renderFallback: function () {
      if (!this.container) return;
      var existing = this.container.querySelector(".aviation-fallback");
      if (existing) return;

      var fallback = document.createElement("div");
      fallback.className = "aviation-fallback";
      fallback.innerHTML = [
        '<div class="sky-photo-layer" style="position: absolute; inset: 0; background-image: url(/static/img/sky-sunset-bg.jpg); background-size: cover; background-position: center;"></div>',
        '<div class="airplane-svg-wrapper" style="position: absolute; top: 32%; left: 50%; width: 560px; transform: translate(-50%, -50%); animation: floatAirplane 5s ease-in-out infinite;">',
        '  <svg class="airplane-svg" viewBox="0 0 1024 400" fill="none" xmlns="http://www.w3.org/2000/svg">',
        '    <path d="M120 180 C280 180 580 160 840 180 C880 182 930 190 900 205 C850 215 540 220 120 208 Z" fill="#F4F8FC" filter="drop-shadow(0 20px 30px rgba(7,27,51,0.5))" />',
        '    <path d="M460 178 L310 50 L380 50 L580 176 Z" fill="#E2EDF7" />',
        '    <path d="M480 205 L360 340 L430 340 L600 205 Z" fill="#8CA4BC" />',
        '    <path d="M305 45 L320 15 L335 18 L320 50 Z" fill="#55B8E8" />',
        '    <path d="M320 15 L328 6 L338 8 L330 20 Z" fill="#FFAD73" />',
        '    <path d="M130 182 L70 65 L120 65 L210 182 Z" fill="#071B33" />',
        '    <rect x="510" y="220" width="130" height="42" rx="18" fill="#071B33" />',
        '    <ellipse cx="640" cy="241" rx="8" ry="18" fill="#55B8E8" opacity="0.8" />',
        '    <path d="M820 182 Q855 184 860 192 L830 193 Z" fill="#050C16" />',
        '  </svg>',
        '</div>'
      ].join("");

      this.container.appendChild(fallback);
    }
  };

  window.Aviation3D = Aviation3D;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (document.getElementById("heroCanvasContainer")) {
        Aviation3D.init("heroCanvasContainer");
      }
    });
  } else {
    if (document.getElementById("heroCanvasContainer")) {
      Aviation3D.init("heroCanvasContainer");
    }
  }

})(window, document);
