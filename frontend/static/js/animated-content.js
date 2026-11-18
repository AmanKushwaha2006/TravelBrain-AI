/**
 * AnimatedContent — GSAP & ScrollTrigger Animation Engine
 * Inspired by @react-bits/AnimatedContent (React Bits) adapted for TravelBrain AI
 * Supports: distance, direction, duration, ease, blur, scale, rotate, tilt, wipe,
 * threshold, delay, stagger, scrub, trigger ('scroll' | 'mount'), once
 */
(function (global) {
  "use strict";

  var WIPES = {
    up: "linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))",
    down: "linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))",
    left: "linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))",
    right: "linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))",
    center: "radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))"
  };

  function AnimatedContent(targetOrSelector, options) {
    if (typeof global.gsap === "undefined") {
      console.warn("[AnimatedContent] GSAP library not found.");
      return null;
    }

    if (global.ScrollTrigger && global.gsap.registerPlugin) {
      global.gsap.registerPlugin(global.ScrollTrigger);
    }

    var elements = [];
    if (typeof targetOrSelector === "string") {
      elements = Array.from(document.querySelectorAll(targetOrSelector));
    } else if (targetOrSelector instanceof Element) {
      elements = [targetOrSelector];
    } else if (targetOrSelector && targetOrSelector.length) {
      elements = Array.from(targetOrSelector);
    }

    if (!elements.length) return null;

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var timelines = elements.map(function (el) {
      var opts = Object.assign({}, options || {});

      // Parse dataset overrides
      var ds = el.dataset || {};
      var distance = opts.distance !== undefined ? Number(opts.distance) : (ds.distance !== undefined ? Number(ds.distance) : 100);
      var direction = opts.direction || ds.direction || "vertical";
      var reverse = opts.reverse !== undefined ? Boolean(opts.reverse) : (ds.reverse === "true");
      var duration = opts.duration !== undefined ? Number(opts.duration) : (ds.duration !== undefined ? Number(ds.duration) : 0.8);
      var ease = opts.ease || ds.ease || "power3.out";
      var initialOpacity = opts.initialOpacity !== undefined ? Number(opts.initialOpacity) : (ds.initialOpacity !== undefined ? Number(ds.initialOpacity) : 0);
      var animateOpacity = opts.animateOpacity !== undefined ? Boolean(opts.animateOpacity) : (ds.animateOpacity !== "false");
      var scale = opts.scale !== undefined ? Number(opts.scale) : (ds.scale !== undefined ? Number(ds.scale) : 1);
      var blur = opts.blur !== undefined ? Number(opts.blur) : (ds.blur !== undefined ? Number(ds.blur) : 0);
      var rotate = opts.rotate !== undefined ? Number(opts.rotate) : (ds.rotate !== undefined ? Number(ds.rotate) : 0);
      var tilt = opts.tilt !== undefined ? Number(opts.tilt) : (ds.tilt !== undefined ? Number(ds.tilt) : 0);
      var wipe = opts.wipe || ds.wipe || "none";
      var threshold = opts.threshold !== undefined ? Number(opts.threshold) : (ds.threshold !== undefined ? Number(ds.threshold) : 0.1);
      var delay = opts.delay !== undefined ? Number(opts.delay) : (ds.delay !== undefined ? Number(ds.delay) : 0);
      var stagger = opts.stagger !== undefined ? Number(opts.stagger) : (ds.stagger !== undefined ? Number(ds.stagger) : 0);
      var staggerFrom = opts.staggerFrom || ds.staggerFrom || "start";
      var trigger = opts.trigger || ds.trigger || "scroll";
      var once = opts.once !== undefined ? Boolean(opts.once) : (ds.once !== "false");
      var scrub = opts.scrub !== undefined ? opts.scrub : (ds.scrub === "true");
      var onStart = opts.onStart;
      var onComplete = opts.onComplete;

      var targets = stagger > 0 && el.children && el.children.length > 0 ? Array.from(el.children) : [el];
      var horizontal = direction === "horizontal";
      var axis = horizontal ? "x" : "y";
      var sign = reverse ? -1 : 1;
      var mask = WIPES[wipe];

      global.gsap.set(el, { visibility: "visible" });

      if (reduceMotion) {
        if (typeof onComplete === "function") onComplete();
        return null;
      }

      var from = {
        scale: scale,
        opacity: animateOpacity ? initialOpacity : 1
      };
      from[axis] = distance * sign;

      var to = {
        scale: 1,
        opacity: 1,
        duration: duration,
        ease: ease
      };
      to[axis] = 0;

      if (blur > 0) {
        from.filter = "blur(" + blur + "px)";
        to.filter = "blur(0px)";
      }
      if (rotate) {
        from.rotation = rotate * sign;
        to.rotation = 0;
      }
      if (tilt) {
        var tiltAxis = horizontal ? "rotationY" : "rotationX";
        from[tiltAxis] = horizontal ? -tilt * sign : tilt * sign;
        to[tiltAxis] = 0;
        from.transformPerspective = 900;
        to.transformPerspective = 900;
      }
      if (mask) {
        global.gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
        from["--ac-wipe"] = 0;
        to["--ac-wipe"] = 1;
      }
      if (stagger > 0) {
        to.stagger = { each: stagger, from: staggerFrom };
      }

      var settle = function () {
        if (scrub) return;
        global.gsap.set(targets, {
          clearProps: mask ? "filter,transform,maskImage,webkitMaskImage" : "filter,transform"
        });
      };

      var tl = global.gsap.timeline({
        paused: true,
        onStart: function () {
          if (typeof onStart === "function") onStart();
        },
        onComplete: function () {
          if (typeof onComplete === "function") onComplete();
          settle();
        }
      });

      tl.fromTo(targets, from, to, scrub ? 0 : Math.max(delay, 0));

      if (trigger === "mount" || !global.ScrollTrigger) {
        tl.play();
        return tl;
      }

      var start = "top " + Math.round((1 - threshold) * 100) + "%";

      if (scrub) {
        global.ScrollTrigger.create({
          trigger: el,
          start: start,
          end: "top " + Math.max(Math.round((1 - threshold) * 100 - 45), 5) + "%",
          scrub: scrub === true ? true : Math.max(Number(scrub) || 0, 0.01),
          animation: tl
        });
        return tl;
      }

      global.ScrollTrigger.create({
        trigger: el,
        start: start,
        once: once,
        onEnter: function () {
          tl.play();
        },
        onLeaveBack: once
          ? undefined
          : function () {
              if (mask) global.gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
              tl.reverse();
            }
      });

      return tl;
    });

    return timelines.length === 1 ? timelines[0] : timelines;
  }

  // Automatic scanner on DOM ready
  function autoInit() {
    // 1. Declarative attributes
    var elements = document.querySelectorAll("[data-animated-content]");
    elements.forEach(function (el) {
      AnimatedContent(el);
    });

    // 2. Default whole-page animation hooks if not explicitly decorated
    var heroContent = document.querySelector(".hero-content");
    if (heroContent && !heroContent.hasAttribute("data-animated-content")) {
      AnimatedContent(heroContent, {
        distance: 50,
        direction: "vertical",
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        trigger: "mount",
        delay: 0.2
      });
    }

    var workflowGrid = document.querySelector(".workflow-grid");
    if (workflowGrid && !workflowGrid.hasAttribute("data-animated-content")) {
      AnimatedContent(workflowGrid, {
        distance: 70,
        direction: "vertical",
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.12,
        threshold: 0.15,
        once: true
      });
    }

    var featuresGrid = document.querySelector(".features-grid");
    if (featuresGrid && !featuresGrid.hasAttribute("data-animated-content")) {
      AnimatedContent(featuresGrid, {
        distance: 60,
        direction: "vertical",
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.09,
        threshold: 0.15,
        once: true
      });
    }

    document.querySelectorAll(".section-header").forEach(function (header) {
      if (!header.hasAttribute("data-animated-content")) {
        AnimatedContent(header, {
          distance: 40,
          direction: "vertical",
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.08,
          threshold: 0.2,
          once: true
        });
      }
    });

    var footerContainer = document.querySelector(".footer-container");
    if (footerContainer && !footerContainer.hasAttribute("data-animated-content")) {
      AnimatedContent(footerContainer, {
        distance: 40,
        direction: "vertical",
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.1,
        threshold: 0.1,
        once: true
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    setTimeout(autoInit, 60);
  }

  // Export to window
  global.AnimatedContent = AnimatedContent;
  global.initAnimatedContent = autoInit;

})(window);

