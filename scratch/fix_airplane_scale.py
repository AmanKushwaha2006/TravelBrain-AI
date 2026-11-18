with open('frontend/static/js/aviation-3d.js', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update loadAircraftModel
old_load = """          // Scale model so wingspan fits screen width gracefully (~15.2 units)
          var size = new THREE.Vector3();
          box.getSize(size);
          var maxDim = Math.max(size.x, size.y, size.z);
          var scaleFactor = 15.2 / maxDim;
          wrapper.scale.set(scaleFactor, scaleFactor, scaleFactor);"""

new_load = """          // Scale model so wingspan fits screen width gracefully (~11.8 units, ~46% of viewport)
          var size = new THREE.Vector3();
          box.getSize(size);
          var maxDim = Math.max(size.x, size.y, size.z);
          var scaleFactor = 11.8 / maxDim;
          self.baseScale = scaleFactor;
          wrapper.scale.set(scaleFactor, scaleFactor, scaleFactor);"""

# 2. Update loadFallbackA320
old_fallback = """          var maxDim = Math.max(size.x, size.y, size.z);
          var s = 15.2 / maxDim;
          wrapper.scale.set(s, s, s);"""

new_fallback = """          var maxDim = Math.max(size.x, size.y, size.z);
          var s = 11.8 / maxDim;
          self.baseScale = s;
          wrapper.scale.set(s, s, s);"""

# 3. Update intro animation
old_intro = """          if (self.introTimer < self.introDuration) {
            self.introTimer += delta;
            var t = Math.min(self.introTimer / self.introDuration, 1.0);
            var ease = 1 - Math.pow(1 - t, 3); // Smooth cubic ease-out
            self.airplane.position.x = -22 + (2.2 - (-22)) * ease;
            self.airplane.position.y = 6.2;
          }"""

new_intro = """          if (self.introTimer < self.introDuration) {
            self.introTimer += delta;
            var t = Math.min(self.introTimer / self.introDuration, 1.0);
            var ease = 1 - Math.pow(1 - t, 3); // Smooth cubic ease-out
            self.airplane.position.x = -22 + (1.2 - (-22)) * ease;
            self.airplane.position.y = 5.8;
            var initScale = (self.baseScale || 0.175);
            self.airplane.scale.set(initScale, initScale, initScale);
          }"""

# 4. Update waypoints and targetScale application
old_waypoints = """            // Full-page flight spline based on scrollProgress
            var p = self.scrollProgress;
            var waypoints = [
              { p: 0.00, pos: [2.2, 6.2, 0.0], rot: [0.03, -0.52, 0.07], scale: 1.0 },
              { p: 0.20, pos: [3.8, 6.8, -1.0], rot: [0.08, -0.65, 0.18], scale: 0.95 },
              { p: 0.50, pos: [3.2, 6.4, -0.5], rot: [0.02, -0.44, -0.04], scale: 1.05 },
              { p: 0.75, pos: [4.2, 5.6, -1.8], rot: [-0.04, -0.58, -0.14], scale: 0.90 },
              { p: 1.00, pos: [2.5, 5.0, -1.0], rot: [0.02, -0.50, 0.04], scale: 0.85 }
            ];"""

new_waypoints = """            // Full-page flight spline based on scrollProgress
            var p = self.scrollProgress;
            var waypoints = [
              { p: 0.00, pos: [1.2, 5.8, 0.0], rot: [0.03, -0.52, 0.07], scale: 1.0 },
              { p: 0.20, pos: [2.6, 6.2, -1.2], rot: [0.08, -0.65, 0.16], scale: 0.92 },
              { p: 0.50, pos: [2.2, 5.9, -0.8], rot: [0.02, -0.44, -0.04], scale: 0.96 },
              { p: 0.75, pos: [3.0, 5.4, -1.8], rot: [-0.04, -0.58, -0.12], scale: 0.88 },
              { p: 1.00, pos: [1.8, 4.8, -1.0], rot: [0.02, -0.50, 0.04], scale: 0.82 }
            ];"""

old_scale_set = "self.airplane.scale.set(targetScale, targetScale, targetScale);"
new_scale_set = """var currentScale = (self.baseScale || 0.175) * targetScale;
            self.airplane.scale.set(currentScale, currentScale, currentScale);"""

old_mobile = """            if (window.innerWidth < 768) {
              targetX = (targetX - 2.2) * 0.35;
              targetY = targetY * 0.85 + 0.8;
              targetScale = targetScale * 0.72;
            }"""

new_mobile = """            if (window.innerWidth < 768) {
              targetX = (targetX - 1.2) * 0.3;
              targetY = targetY * 0.85 + 0.6;
              targetScale = targetScale * 0.75;
            }"""

assert old_load in c, "old_load not found"
assert old_fallback in c, "old_fallback not found"
assert old_intro in c, "old_intro not found"
assert old_waypoints in c, "old_waypoints not found"
assert old_scale_set in c, "old_scale_set not found"
assert old_mobile in c, "old_mobile not found"

c = c.replace(old_load, new_load)
c = c.replace(old_fallback, new_fallback)
c = c.replace(old_intro, new_intro)
c = c.replace(old_waypoints, new_waypoints)
c = c.replace(old_scale_set, new_scale_set)
c = c.replace(old_mobile, new_mobile)

with open('frontend/static/js/aviation-3d.js', 'w', encoding='utf-8') as f:
    f.write(c)

with open('dist/static/js/aviation-3d.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Successfully updated aviation-3d.js in both frontend/ and dist/!")
