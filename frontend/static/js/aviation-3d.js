/**
 * TravelBrain AI — Ultra-Realistic Cinematic Aviation Engine
 * Hollywood VFX Aircraft Flight Experience, Atmospheric Sunsets & Multi-Camera Cinematography
 */
(function (window, document) {
  "use strict";

  var Aviation3D = {
    renderer: null,
    scene: null,
    camera: null,
    airplane: null,
    aircraftModel: null,
    engineFans: [],
    strobeLights: [],
    beaconLights: [],
    beaconTimer: 0,
    strobeTimer: 0,
    fanRotationSpeed: 0.35,

    cloudGroup: null,
    foregroundClouds: null,
    skyBackdrop: null,
    lights: {},

    // Camera Modes
    currentCameraMode: "front", // "front", "side", "wing", "director"
    directorTimer: null,
    cameraPositions: {
      front: {
        pos: new THREE.Vector3(0, 1.2, 18),
        lookAt: new THREE.Vector3(0, 0.2, 0),
        fov: 42
      },
      side: {
        pos: new THREE.Vector3(18, 2.5, 12),
        lookAt: new THREE.Vector3(0, 0, 0),
        fov: 40
      },
      wing: {
        pos: new THREE.Vector3(-14, 3.8, -10),
        lookAt: new THREE.Vector3(4, 0.5, 12),
        fov: 46
      }
    },

    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    scrollProgress: 0,
    container: null,
    canvas: null,
    animFrameId: null,
    isRunning: false,
    isVisible: true,
    wingGroupLeft: null,
    wingGroupRight: null,

    init: function (containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        this.renderFallback();
        return;
      }

      if (typeof window.THREE === "undefined") {
        console.warn("Three.js not loaded. Activating fallback.");
        this.renderFallback();
        return;
      }

      try {
        this.setupScene();
        this.setupLighting();
        this.buildAtmosphereAndSky();
        this.buildClouds();
        this.buildAircraft();
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
      // Distance atmospheric haze matching the reference image's deep twilight sky
      this.scene.fog = new THREE.FogExp2(0x13273e, 0.0075);

      var defaultCam = this.cameraPositions.front;
      this.camera = new THREE.PerspectiveCamera(defaultCam.fov, width / height, 0.1, 1200);
      this.camera.position.copy(defaultCam.pos);
      this.camera.lookAt(defaultCam.lookAt);

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;
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

      this.container.appendChild(this.canvas);
    },

    setupLighting: function () {
      // 1. Primary Sunset Key Sun (matching upper-left golden sun in reference image)
      var sunLight = new THREE.DirectionalLight(0xffdfa8, 2.8);
      sunLight.position.set(-35, 26, 22);
      this.scene.add(sunLight);
      this.lights.sun = sunLight;

      // 2. Secondary Golden Cloud Bounce (warm light reflecting off sunset clouds below)
      var cloudBounce = new THREE.DirectionalLight(0xffa866, 1.4);
      cloudBounce.position.set(0, -25, 10);
      this.scene.add(cloudBounce);
      this.lights.cloudBounce = cloudBounce;

      // 3. Atmospheric Hemisphere Light (sky: sunset cyan/blue, ground: deep twilight cloud grey)
      var hemiLight = new THREE.HemisphereLight(0x55b8e8, 0x162c44, 0.95);
      hemiLight.position.set(0, 50, 0);
      this.scene.add(hemiLight);
      this.lights.hemi = hemiLight;

      // 4. Rim / Wingtip Glint Light (highlights polished aircraft edge profiles)
      var rimLight = new THREE.DirectionalLight(0xffeedd, 1.2);
      rimLight.position.set(25, -10, -20);
      this.scene.add(rimLight);
      this.lights.rim = rimLight;
    },

    buildAtmosphereAndSky: function () {
      var self = this;
      var textureLoader = new THREE.TextureLoader();

      // Clean background plate from reference image
      textureLoader.load(
        "/static/img/sky-sunset-bg.jpg",
        function (texture) {
          texture.encoding = THREE.sRGBEncoding;

          // Panoramic curved sky backdrop
          var bgGeo = new THREE.PlaneGeometry(180, 110);
          var bgMat = new THREE.MeshBasicMaterial({
            map: texture,
            depthWrite: false,
            transparent: true,
            opacity: 0.96
          });

          var bgMesh = new THREE.Mesh(bgGeo, bgMat);
          bgMesh.position.set(0, 4, -55);
          self.scene.add(bgMesh);
          self.skyBackdrop = bgMesh;
        },
        undefined,
        function () {
          // Shader fallback if texture is unavailable
          var bgGeo = new THREE.PlaneGeometry(180, 110);
          var bgMat = new THREE.ShaderMaterial({
            uniforms: {
              colorTop: { value: new THREE.Color(0x0a1c30) },
              colorMid: { value: new THREE.Color(0x274d75) },
              colorSunset: { value: new THREE.Color(0xffb873) },
              colorGlow: { value: new THREE.Color(0xffe2b8) }
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
              "uniform vec3 colorGlow;",
              "varying vec2 vUv;",
              "void main() {",
              "  vec3 grad = mix(colorMid, colorTop, smoothstep(0.4, 1.0, vUv.y));",
              "  float sun = exp(-length(vUv - vec2(0.2, 0.75)) * 3.8);",
              "  grad = mix(grad, colorSunset, smoothstep(0.1, 0.45, vUv.y) * (1.0 - smoothstep(0.45, 0.85, vUv.y)));",
              "  grad += colorGlow * sun * 1.5;",
              "  gl_FragColor = vec4(grad, 1.0);",
              "}"
            ].join("\n"),
            depthWrite: false
          });

          var bgMesh = new THREE.Mesh(bgGeo, bgMat);
          bgMesh.position.set(0, 4, -55);
          self.scene.add(bgMesh);
          self.skyBackdrop = bgMesh;
        }
      );
    },

    buildAircraft: function () {
      var self = this;
      this.airplane = new THREE.Group();

      // Try loading the realistic GLB model first
      if (typeof THREE.GLTFLoader !== "undefined") {
        var loader = new THREE.GLTFLoader();
        loader.load(
          "/static/models/A320.glb",
          function (gltf) {
            var model = gltf.scene;

            // Apply Hollywood VFX PBR Aircraft Materials
            var fuselageMat = new THREE.MeshPhysicalMaterial({
              color: 0xf6f9fc,
              roughness: 0.26,
              metalness: 0.38,
              clearcoat: 0.85,
              clearcoatRoughness: 0.12,
              reflectivity: 0.75
            });

            var metalLeadingEdgeMat = new THREE.MeshStandardMaterial({
              color: 0xc4d6e8,
              roughness: 0.14,
              metalness: 0.9
            });

            var glassMat = new THREE.MeshPhysicalMaterial({
              color: 0x07111c,
              roughness: 0.04,
              metalness: 0.95,
              transmission: 0.45,
              transparent: true,
              opacity: 0.95
            });

            model.traverse(function (child) {
              if (child.isMesh) {
                child.castShadow = false;
                child.receiveShadow = false;
                child.material = fuselageMat;
              }
            });

            // Scale and center realistic Airbus A320
            model.scale.set(0.18, 0.18, 0.18);
            model.rotation.set(0, Math.PI, 0); // face towards front tracking camera

            self.attachEngineTurbines(model);
            self.attachNavigationStrobes(model);

            self.aircraftModel = model;
            self.airplane.add(model);
          },
          undefined,
          function (error) {
            console.warn("Could not load A320.glb, activating high-detail procedural commercial airliner.", error);
            self.buildProceduralCommercialJet();
          }
        );
      } else {
        self.buildProceduralCommercialJet();
      }

      // Initial orientation & position (cruising towards camera with slight bank)
      this.airplane.position.set(0, 0, 0);
      this.airplane.rotation.set(0.04, 0, 0.05);

      this.scene.add(this.airplane);
    },

    attachEngineTurbines: function (parent) {
      // Rotating Turbofan assemblies inside jet engines
      var fanMat = new THREE.MeshStandardMaterial({
        color: 0x222933,
        roughness: 0.3,
        metalness: 0.85
      });

      var spinnerMat = new THREE.MeshStandardMaterial({
        color: 0x111620,
        roughness: 0.2,
        metalness: 0.9
      });

      var glowMat = new THREE.MeshBasicMaterial({
        color: 0x66c8ff,
        transparent: true,
        opacity: 0.75
      });

      var buildFan = function (x, y, z) {
        var fanGroup = new THREE.Group();

        // 18 angled aerodynamic turbine blades
        for (var b = 0; b < 18; b++) {
          var bladeGeo = new THREE.BoxGeometry(0.35, 3.2, 0.08);
          var blade = new THREE.Mesh(bladeGeo, fanMat);
          var angle = (b / 18) * Math.PI * 2;
          blade.position.set(Math.cos(angle) * 1.6, Math.sin(angle) * 1.6, 0);
          blade.rotation.z = angle + 0.3;
          blade.rotation.y = 0.45; // pitch
          fanGroup.add(blade);
        }

        // Center Spinner cone
        var cone = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.2, 24), spinnerMat);
        cone.rotation.x = Math.PI / 2;
        cone.position.z = 0.8;
        fanGroup.add(cone);

        fanGroup.position.set(x, y, z);
        fanGroup.scale.set(0.24, 0.24, 0.24);
        return fanGroup;
      };

      var leftFan = buildFan(-6.2, -1.8, 4.5);
      var rightFan = buildFan(6.2, -1.8, 4.5);

      parent.add(leftFan);
      parent.add(rightFan);

      this.engineFans.push(leftFan);
      this.engineFans.push(rightFan);
    },

    attachNavigationStrobes: function (parent) {
      // Port wingtip red strobe
      var portStrobe = new THREE.PointLight(0xff2233, 2.0, 8);
      portStrobe.position.set(-18.5, 0.2, -2.5);
      parent.add(portStrobe);
      this.strobeLights.push(portStrobe);

      // Starboard wingtip green strobe
      var starStrobe = new THREE.PointLight(0x22ff66, 2.0, 8);
      starStrobe.position.set(18.5, 0.2, -2.5);
      parent.add(starStrobe);
      this.strobeLights.push(starStrobe);

      // Tail apex anti-collision white strobe
      var tailStrobe = new THREE.PointLight(0xffffff, 2.5, 12);
      tailStrobe.position.set(0, 8.2, -15.5);
      parent.add(tailStrobe);
      this.strobeLights.push(tailStrobe);

      // Fuselage top & belly rotating red beacons
      var topBeacon = new THREE.PointLight(0xff1122, 1.8, 6);
      topBeacon.position.set(0, 2.2, -2);
      parent.add(topBeacon);
      this.beaconLights.push(topBeacon);

      var bellyBeacon = new THREE.PointLight(0xff1122, 1.8, 6);
      bellyBeacon.position.set(0, -2.2, -2);
      parent.add(bellyBeacon);
      this.beaconLights.push(bellyBeacon);
    },

    buildProceduralCommercialJet: function () {
      // Photorealistic multi-component commercial airliner
      var jet = new THREE.Group();

      var fuselageMat = new THREE.MeshPhysicalMaterial({
        color: 0xf5f8fc,
        roughness: 0.24,
        metalness: 0.42,
        clearcoat: 0.85,
        clearcoatRoughness: 0.1
      });

      var metalTrimMat = new THREE.MeshStandardMaterial({
        color: 0xc4d6e8,
        roughness: 0.14,
        metalness: 0.9
      });

      var navyLiveryMat = new THREE.MeshStandardMaterial({
        color: 0x071b33,
        roughness: 0.28,
        metalness: 0.5
      });

      var skyLiveryMat = new THREE.MeshStandardMaterial({
        color: 0x55b8e8,
        roughness: 0.2,
        metalness: 0.6
      });

      var orangeAccentMat = new THREE.MeshStandardMaterial({
        color: 0xffad73,
        roughness: 0.25,
        metalness: 0.4
      });

      var glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x07111c,
        roughness: 0.04,
        metalness: 0.96,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.92
      });

      // 1. Fuselage
      var bodyGeo = new THREE.CylinderGeometry(1.35, 1.35, 16, 36);
      bodyGeo.rotateX(Math.PI / 2);
      var body = new THREE.Mesh(bodyGeo, fuselageMat);
      jet.add(body);

      // Nose section
      var noseGeo = new THREE.CylinderGeometry(1.35, 0.28, 5.8, 36);
      noseGeo.rotateX(-Math.PI / 2);
      var nose = new THREE.Mesh(noseGeo, fuselageMat);
      nose.position.z = 10.9;
      jet.add(nose);

      var noseCap = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 24), fuselageMat);
      noseCap.position.z = 13.8;
      jet.add(noseCap);

      // Cockpit Windshield (angled flight deck glass matching reference)
      var cockpitGeo = new THREE.CylinderGeometry(1.32, 0.88, 2.4, 24, 1, false, -Math.PI * 0.38, Math.PI * 0.76);
      cockpitGeo.rotateX(-Math.PI / 2);
      var cockpit = new THREE.Mesh(cockpitGeo, glassMat);
      cockpit.position.set(0, 0.48, 10.4);
      jet.add(cockpit);

      // Tail Cone
      var tailConeGeo = new THREE.CylinderGeometry(0.35, 1.35, 7.5, 36);
      tailConeGeo.rotateX(-Math.PI / 2);
      var tailCone = new THREE.Mesh(tailConeGeo, fuselageMat);
      tailCone.position.set(0, 0.25, -11.75);
      jet.add(tailCone);

      // 2. Swept Aerodynamic Wings with Dihedral
      var buildWing = function (isLeft) {
        var wingGroup = new THREE.Group();
        var xSign = isLeft ? -1 : 1;

        var wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(15.5 * xSign, -4.5);
        wingShape.lineTo(15.5 * xSign, -2.8);
        wingShape.lineTo(0, 4.2);
        wingShape.closePath();

        var wingGeo = new THREE.ExtrudeGeometry(wingShape, {
          depth: 0.38,
          bevelEnabled: true,
          bevelThickness: 0.14,
          bevelSize: 0.12,
          bevelSegments: 4
        });
        wingGeo.rotateX(Math.PI / 2);
        wingGeo.rotateZ(0.045 * xSign); // dihedral tilt

        var wingMesh = new THREE.Mesh(wingGeo, fuselageMat);
        wingGroup.add(wingMesh);

        // Blended Sharklet / Winglet
        var wingletGeo = new THREE.BoxGeometry(0.18, 2.4, 1.8);
        var winglet = new THREE.Mesh(wingletGeo, skyLiveryMat);
        winglet.position.set(15.5 * xSign, 1.2, -3.6);
        winglet.rotation.z = -0.22 * xSign;
        wingGroup.add(winglet);

        var wingletTip = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.6, 1.8), orangeAccentMat);
        wingletTip.position.set(15.5 * xSign, 2.2, -3.6);
        wingletTip.rotation.z = -0.22 * xSign;
        wingGroup.add(wingletTip);

        return wingGroup;
      };

      this.wingGroupLeft = buildWing(true);
      this.wingGroupRight = buildWing(false);
      this.wingGroupLeft.position.set(0, -0.3, 0);
      this.wingGroupRight.position.set(0, -0.3, 0);
      jet.add(this.wingGroupLeft);
      jet.add(this.wingGroupRight);

      // 3. Turbofan Jet Engines
      var buildEngine = function (xPos) {
        var eng = new THREE.Group();
        var nacelleGeo = new THREE.CylinderGeometry(0.88, 0.84, 4.5, 32);
        nacelleGeo.rotateX(Math.PI / 2);
        var nacelle = new THREE.Mesh(nacelleGeo, navyLiveryMat);
        eng.add(nacelle);

        var lipGeo = new THREE.TorusGeometry(0.86, 0.1, 16, 32);
        var lip = new THREE.Mesh(lipGeo, metalTrimMat);
        lip.position.z = 2.25;
        eng.add(lip);

        // Pylon mount
        var pylonGeo = new THREE.BoxGeometry(0.24, 0.9, 3.2);
        var pylon = new THREE.Mesh(pylonGeo, metalTrimMat);
        pylon.position.set(0, 0.6, 0);
        eng.add(pylon);

        eng.position.set(xPos, -1.3, 1.8);
        return eng;
      };

      jet.add(buildEngine(-5.5));
      jet.add(buildEngine(5.5));

      // 4. Vertical Stabilizer (Tail Fin with TravelBrain Livery)
      var finShape = new THREE.Shape();
      finShape.moveTo(0, 0);
      finShape.lineTo(0, 6.2);
      finShape.lineTo(-1.8, 6.2);
      finShape.lineTo(-5.2, 0);
      finShape.closePath();

      var finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.28, bevelEnabled: true, bevelSize: 0.08 });
      var finMesh = new THREE.Mesh(finGeo, navyLiveryMat);
      finMesh.position.set(0.14, 1.2, -10.5);
      jet.add(finMesh);

      // Tailplanes (Horizontal Stabilizers)
      var buildTailPlane = function (isLeft) {
        var xSign = isLeft ? -1 : 1;
        var hShape = new THREE.Shape();
        hShape.moveTo(0, 0);
        hShape.lineTo(5.5 * xSign, -1.6);
        hShape.lineTo(5.5 * xSign, -0.8);
        hShape.lineTo(0, 2.2);
        hShape.closePath();
        var hMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(hShape, { depth: 0.2, bevelEnabled: true, bevelSize: 0.04 }), fuselageMat);
        hMesh.rotateX(Math.PI / 2);
        hMesh.position.set(0, 0.8, -13.5);
        return hMesh;
      };
      jet.add(buildTailPlane(true));
      jet.add(buildTailPlane(false));

      this.attachEngineTurbines(jet);
      this.attachNavigationStrobes(jet);

      this.aircraftModel = jet;
      this.airplane.add(jet);
    },

    buildClouds: function () {
      this.cloudGroup = new THREE.Group();
      this.foregroundClouds = new THREE.Group();

      var cloudMat = new THREE.MeshStandardMaterial({
        color: 0xf6f9fc,
        roughness: 0.95,
        metalness: 0.02,
        transparent: true,
        opacity: 0.52,
        depthWrite: false
      });

      var fgCloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.98,
        metalness: 0.0,
        transparent: true,
        opacity: 0.28,
        depthWrite: false
      });

      var sphereGeo = new THREE.SphereGeometry(1.2, 12, 12);

      // Midground & Background Cloud Formations (stretching below to horizon)
      for (var i = 0; i < 28; i++) {
        var cluster = new THREE.Group();
        var puffCount = 6 + Math.floor(Math.random() * 6);

        for (var p = 0; p < puffCount; p++) {
          var puff = new THREE.Mesh(sphereGeo, cloudMat);
          var s = 2.4 + Math.random() * 3.8;
          puff.scale.set(s * 1.6, s * 0.75, s * 1.2);
          puff.position.set(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 2.5,
            (Math.random() - 0.5) * 6
          );
          cluster.add(puff);
        }

        cluster.position.set(
          (Math.random() - 0.5) * 85,
          -6.5 - Math.random() * 10,
          -35 + Math.random() * 60
        );

        cluster.userData = {
          speed: 0.06 + Math.random() * 0.08,
          respawnZ: 25,
          resetZ: -45
        };

        this.cloudGroup.add(cluster);
      }
      this.scene.add(this.cloudGroup);

      // Foreground Wisps passing across camera and wings
      for (var f = 0; f < 8; f++) {
        var fgCluster = new THREE.Group();
        for (var fp = 0; fp < 4; fp++) {
          var fgPuff = new THREE.Mesh(sphereGeo, fgCloudMat);
          var fs = 3.5 + Math.random() * 4.5;
          fgPuff.scale.set(fs * 2.2, fs * 0.6, fs * 1.4);
          fgPuff.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 4
          );
          fgCluster.add(fgPuff);
        }

        fgCluster.position.set(
          (Math.random() - 0.5) * 40,
          -2 + Math.random() * 5,
          5 + Math.random() * 15
        );

        fgCluster.userData = {
          speed: 0.12 + Math.random() * 0.1
        };

        this.foregroundClouds.add(fgCluster);
      }
      this.scene.add(this.foregroundClouds);
    },

    setCameraMode: function (mode) {
      if (!this.cameraPositions[mode] && mode !== "director") return;
      this.currentCameraMode = mode;

      // Update UI pills
      document.querySelectorAll(".cam-btn").forEach(function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-cam") === mode);
      });

      if (mode === "director") {
        this.startDirectorSequence();
        return;
      } else {
        if (this.directorTimer) {
          clearInterval(this.directorTimer);
          this.directorTimer = null;
        }
      }

      var targetConfig = this.cameraPositions[mode];
      if (window.gsap && this.camera) {
        gsap.to(this.camera.position, {
          x: targetConfig.pos.x,
          y: targetConfig.pos.y,
          z: targetConfig.pos.z,
          duration: 2.2,
          ease: "power2.inOut"
        });

        gsap.to(this.camera, {
          fov: targetConfig.fov,
          duration: 2.2,
          ease: "power2.inOut",
          onUpdate: () => { this.camera.updateProjectionMatrix(); }
        });
      } else if (this.camera) {
        this.camera.position.copy(targetConfig.pos);
        this.camera.fov = targetConfig.fov;
        this.camera.updateProjectionMatrix();
      }
    },

    startDirectorSequence: function () {
      var self = this;
      var modes = ["front", "side", "wing"];
      var idx = 0;

      function nextShot() {
        var mode = modes[idx % modes.length];
        var targetConfig = self.cameraPositions[mode];

        if (window.gsap && self.camera) {
          gsap.to(self.camera.position, {
            x: targetConfig.pos.x,
            y: targetConfig.pos.y,
            z: targetConfig.pos.z,
            duration: 3.5,
            ease: "sine.inOut"
          });

          gsap.to(self.camera, {
            fov: targetConfig.fov,
            duration: 3.5,
            ease: "sine.inOut",
            onUpdate: () => { self.camera.updateProjectionMatrix(); }
          });
        }
        idx++;
      }

      nextShot();
      if (this.directorTimer) clearInterval(this.directorTimer);
      this.directorTimer = setInterval(nextShot, 11000);
    },

    setupCameraControls: function () {
      var self = this;
      document.querySelectorAll(".cam-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var mode = btn.getAttribute("data-cam");
          self.setCameraMode(mode);
        });
      });
    },

    setupEvents: function () {
      var self = this;

      window.addEventListener("mousemove", function (e) {
        var nx = (e.clientX / window.innerWidth) * 2 - 1;
        var ny = -(e.clientY / window.innerHeight) * 2 + 1;
        self.mouse.targetX = nx * 0.45;
        self.mouse.targetY = ny * 0.3;
      }, { passive: true });

      window.addEventListener("resize", function () {
        self.onResize();
      }, { passive: true });

      window.addEventListener("scroll", function () {
        var scrollY = window.scrollY || document.documentElement.scrollTop;
        var maxScroll = Math.max(1, window.innerHeight * 1.4);
        self.scrollProgress = Math.min(1, Math.max(0, scrollY / maxScroll));
      }, { passive: true });

      if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            self.isVisible = entry.isIntersecting;
          });
        }, { threshold: 0.05 });
        observer.observe(this.container);
      }

      document.addEventListener("visibilitychange", function () {
        self.isVisible = !document.hidden;
      });
    },

    onResize: function () {
      if (!this.renderer || !this.camera || !this.container) return;
      var width = this.container.clientWidth || window.innerWidth;
      var height = this.container.clientHeight || window.innerHeight;

      this.camera.aspect = width / height;

      if (width < 768) {
        this.camera.position.z = this.cameraPositions[this.currentCameraMode === "director" ? "front" : this.currentCameraMode].pos.z * 1.25;
      }

      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    },

    startLoop: function () {
      var self = this;
      var clock = new THREE.Clock();
      this.isRunning = true;

      function render() {
        self.animFrameId = requestAnimationFrame(render);
        if (!self.isVisible) return;

        var delta = clock.getDelta();
        var elapsedTime = clock.getElapsedTime();

        // 1. Mouse Lerping (smooth aerodynamic feel)
        self.mouse.x += (self.mouse.targetX - self.mouse.x) * 0.045;
        self.mouse.y += (self.mouse.targetY - self.mouse.y) * 0.045;

        // 2. High-speed Rotating Turbofans
        for (var f = 0; f < self.engineFans.length; f++) {
          self.engineFans[f].rotation.z += self.fanRotationSpeed;
        }

        // 3. Realistic Aircraft Aerodynamic Physics & Flight Dynamics
        if (self.airplane) {
          // Atmospheric turbulence & breathing oscillation
          var turbulencePitch = Math.sin(elapsedTime * 1.5) * 0.02 + Math.cos(elapsedTime * 0.8) * 0.01;
          var turbulenceRoll = Math.cos(elapsedTime * 1.1) * 0.035;
          var turbulenceY = Math.sin(elapsedTime * 1.8) * 0.16;

          // Banking into turn
          var bankAngle = -self.mouse.x * 0.28 + turbulenceRoll;
          var pitchAngle = 0.04 - self.mouse.y * 0.14 + turbulencePitch;
          var yawAngle = self.mouse.x * 0.12;

          self.airplane.position.y = turbulenceY + self.mouse.y * 1.2 + self.scrollProgress * 4.5;
          self.airplane.position.x = self.mouse.x * 2.2 - self.scrollProgress * 2.8;

          self.airplane.rotation.z = bankAngle;
          self.airplane.rotation.x = pitchAngle;
          self.airplane.rotation.y = yawAngle;

          // Subtle wing flex
          if (self.wingGroupLeft && self.wingGroupRight) {
            var wingFlex = Math.sin(elapsedTime * 2.2) * 0.015;
            self.wingGroupLeft.rotation.z = wingFlex;
            self.wingGroupRight.rotation.z = -wingFlex;
          }
        }

        // 4. Clouds Forward Velocity (drifting towards camera & past aircraft)
        if (self.cloudGroup) {
          for (var c = 0; c < self.cloudGroup.children.length; c++) {
            var cloud = self.cloudGroup.children[c];
            cloud.position.z += cloud.userData.speed;
            if (cloud.position.z > cloud.userData.respawnZ) {
              cloud.position.z = cloud.userData.resetZ;
              cloud.position.x = (Math.random() - 0.5) * 85;
            }
          }
        }

        if (self.foregroundClouds) {
          for (var fc = 0; fc < self.foregroundClouds.children.length; fc++) {
            var fgCloud = self.foregroundClouds.children[fc];
            fgCloud.position.z += fgCloud.userData.speed;
            if (fgCloud.position.z > 22) {
              fgCloud.position.z = -5;
              fgCloud.position.x = (Math.random() - 0.5) * 40;
            }
          }
        }

        // 5. Aviation Strobes & Beacons (aviation rhythmic flash)
        self.strobeTimer += delta;
        var isStrobeFlash = Math.sin(self.strobeTimer * 6.5) > 0.82;
        for (var s = 0; s < self.strobeLights.length; s++) {
          self.strobeLights[s].intensity = isStrobeFlash ? 3.0 : 0.3;
        }

        self.beaconTimer += delta;
        var isBeaconFlash = Math.sin(self.beaconTimer * 4.2) > 0.75;
        for (var b = 0; b < self.beaconLights.length; b++) {
          self.beaconLights[b].intensity = isBeaconFlash ? 2.2 : 0.2;
        }

        // 6. Camera LookAt Target
        var currentLook = self.cameraPositions[self.currentCameraMode === "director" ? "front" : self.currentCameraMode].lookAt;
        self.camera.lookAt(currentLook.x + self.mouse.x * 0.5, currentLook.y + self.mouse.y * 0.3, currentLook.z);

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
        '<div class="sky-photo-layer" style="background-image: url(/static/img/sky-sunset-bg.jpg); background-size: cover; background-position: center;"></div>',
        '<div class="cloud-layer cloud-layer-front"></div>'
      ].join("");

      this.container.appendChild(fallback);
    }
  };

  window.Aviation3D = Aviation3D;
})(window, document);
