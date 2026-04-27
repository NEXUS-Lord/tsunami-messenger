window.playerKeys = {};

(function() {
  document.addEventListener('keydown', function(e) {
    window.playerKeys[e.code] = true;
  });
  document.addEventListener('keyup', function(e) {
    window.playerKeys[e.code] = false;
  });
})();

window.createPlayer = function(scene) {

  // --- Motorcycle mesh ---
  var group = new THREE.Group();

  // Body
  var bodyGeo = new THREE.BoxGeometry(2, 0.6, 1);
  var bodyMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.player });
  var body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0;
  group.add(body);

  // Handlebar
  var barGeo = new THREE.BoxGeometry(1.4, 0.1, 0.1);
  var barMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
  var handlebar = new THREE.Mesh(barGeo, barMat);
  handlebar.position.set(0.7, 0.35, 0);
  group.add(handlebar);

  // Wheels
  var wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8);
  var wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

  var frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
  frontWheel.rotation.z = Math.PI / 2;
  frontWheel.position.set(0.9, -0.3, 0);
  group.add(frontWheel);

  var backWheel = new THREE.Mesh(wheelGeo, wheelMat);
  backWheel.rotation.z = Math.PI / 2;
  backWheel.position.set(-0.9, -0.3, 0);
  group.add(backWheel);

  group.position.set(0, 0.5, 0);
  scene.add(group);

  // --- Physics state ---
  var speed = 0;
  var halfCity = CONFIG.CITY_SIZE / 2;

  // --- Helpers ---
  function collidesWithBuilding(nx, nz) {
    var buildings = window.CITY_BUILDINGS;
    if (!buildings || !buildings.length) return false;
    for (var i = 0; i < buildings.length; i++) {
      var b = buildings[i];
      // Small margin so the bike doesn't clip into walls
      if (nx > b.minX - 0.6 && nx < b.maxX + 0.6 &&
          nz > b.minZ - 0.6 && nz < b.maxZ + 0.6) {
        return true;
      }
    }
    return false;
  }

  // --- Player object ---
  var player = {

    mesh: group,
    drowned: false,

    get position() { return group.position; },
    get rotation()  { return group.rotation.y; },

    update: function(delta, keys, waterLevel) {

      // --- Acceleration ---
      // BUG 1 FIX: W/Up = forward (positive speed), S/Down = backward (negative speed).
      // "Forward" in this coordinate system means DECREASING Z (into the scene).
      var accel = CONFIG.PLAYER_SPEED * 0.12;
      var friction = 0.88;

      if (keys['KeyW'] || keys['ArrowUp']) {
        speed += accel;
      } else if (keys['KeyS'] || keys['ArrowDown']) {
        speed -= accel * 0.5;
      } else {
        speed *= friction;
        if (Math.abs(speed) < 0.001) speed = 0;
      }

      // Clamp speed
      speed = Math.max(-CONFIG.PLAYER_SPEED * 0.5, Math.min(CONFIG.PLAYER_SPEED, speed));

      // --- Turning (only when moving) ---
      if (Math.abs(speed) > 0.01) {
        var turnScale = CONFIG.PLAYER_TURN_SPEED * (speed / CONFIG.PLAYER_SPEED);
        if (keys['KeyA'] || keys['ArrowLeft'])  { group.rotation.y += turnScale; }
        if (keys['KeyD'] || keys['ArrowRight']) { group.rotation.y -= turnScale; }
      }

      // --- BUG 1 FIX: correct movement direction ---
      // W moves forward = negative Z in Three.js (sin/cos from rotation.y)
      // Original had += for Z which caused reversed controls.
      var sinY = Math.sin(group.rotation.y);
      var cosY = Math.cos(group.rotation.y);

      var nx = group.position.x + sinY * speed;
      var nz = group.position.z - cosY * speed;  // <-- negative = forward

      // --- Clamp to city bounds ---
      nx = Math.max(-halfCity, Math.min(halfCity, nx));
      nz = Math.max(-halfCity, Math.min(halfCity, nz));

      // --- BUG 2 FIX: AABB collision detection ---
      // Try full move first, then axis-separated fallbacks
      if (!collidesWithBuilding(nx, nz)) {
        group.position.x = nx;
        group.position.z = nz;
      } else {
        // Try sliding along X only
        var slideX = group.position.x + sinY * speed;
        slideX = Math.max(-halfCity, Math.min(halfCity, slideX));
        if (!collidesWithBuilding(slideX, group.position.z)) {
          group.position.x = slideX;
        } else {
          // Try sliding along Z only
          var slideZ = group.position.z - cosY * speed;
          slideZ = Math.max(-halfCity, Math.min(halfCity, slideZ));
          if (!collidesWithBuilding(group.position.x, slideZ)) {
            group.position.z = slideZ;
          }
          // Both blocked: stop (position unchanged)
        }
      }

      // --- Wheel spin ---
      frontWheel.rotation.y += speed * 2;
      backWheel.rotation.y  += speed * 2;

      // --- Drowning check ---
      if (group.position.y <= waterLevel + 0.3) {
        this.drowned = true;
      }
    },

    checkDelivery: function(deliveryPoints) {
      for (var i = 0; i < deliveryPoints.length; i++) {
        var dp = deliveryPoints[i];
        var dx = group.position.x - dp.mesh.position.x;
        var dy = group.position.y - dp.mesh.position.y;
        var dz = group.position.z - dp.mesh.position.z;
        if (Math.sqrt(dx*dx + dy*dy + dz*dz) < 3) {
          return i;
        }
      }
      return -1;
    }

  };

  return player;
};