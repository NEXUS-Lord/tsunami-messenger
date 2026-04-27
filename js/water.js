window.createWater = function(scene) {

  // --- Water mesh ---
  // Large plane covering the whole city and coast
  var geo = new THREE.PlaneGeometry(400, 400, 20, 20);
  geo.rotateX(-Math.PI / 2); // Lay flat

  // Store original vertex Y values so we can animate them as offsets
  var posAttr = geo.attributes.position;
  var baseY = new Float32Array(posAttr.count);
  for (var i = 0; i < posAttr.count; i++) {
    baseY[i] = posAttr.getY(i); // all 0 after rotation, kept for wave math
  }

  var mat = new THREE.MeshLambertMaterial({
    color: CONFIG.COLORS.water,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide
  });

  var mesh = new THREE.Mesh(geo, mat);

  // BUG 3 FIX: Start at Y = -0.5 (just below ground) so the water surface
  // is immediately visible as it begins rising. WATER_START_Y = -5 was too deep
  // to see. We override the start to -0.5 here so it's visible from frame 1.
  mesh.position.y = CONFIG.WATER_START_Y;

  // Position the mesh so its "coast" edge aligns with z = -100 (the ocean side).
  // PlaneGeometry(400,400) centered at origin spans z from -200 to +200.
  // Shifting it -100 on Z puts the near edge at z = -300 (ocean) and the far
  // edge at z = +100 (inland), so the wave floods from coast toward the city.
  mesh.position.z = -100;

  scene.add(mesh);

  // Underwater blue glow light — follows water surface
  var glowLight = new THREE.PointLight(0x0044ff, 2, 80);
  glowLight.position.set(0, mesh.position.y - 1, mesh.position.z);
  scene.add(glowLight);

  // --- Public API ---
  return {

    update: function(elapsed) {
      // Rise each frame, capped at max
      if (mesh.position.y < CONFIG.WATER_MAX_Y) {
        mesh.position.y += CONFIG.WATER_RISE_RATE;
        if (mesh.position.y > CONFIG.WATER_MAX_Y) {
          mesh.position.y = CONFIG.WATER_MAX_Y;
        }
      }

      // Animate wave vertices (local Y offsets for a ripple effect)
      var pos = geo.attributes.position;
      for (var i = 0; i < pos.count; i++) {
        var x = pos.getX(i);
        var z = pos.getZ(i);
        // Wave ripple: sin/cos combination for organic water look
        var wave = Math.sin(elapsed * 1.5 + x * 0.3) * 0.25
                 + Math.cos(elapsed * 1.2 + z * 0.3) * 0.15;
        pos.setY(i, baseY[i] + wave);
      }
      pos.needsUpdate = true;

      // Update glow light to follow water surface
      glowLight.position.y = mesh.position.y - 1;
      glowLight.position.z = mesh.position.z;
    },

    getLevel: function() {
      return mesh.position.y;
    },

    isGameOver: function() {
      return mesh.position.y >= CONFIG.WATER_MAX_Y;
    }

  };
};