window.playerKeys = {};

window.addEventListener('keydown', function(e) {
    window.playerKeys[e.code] = true;
});
window.addEventListener('keyup', function(e) {
    window.playerKeys[e.code] = false;
});

window.createPlayer = function(scene) {
    var CONFIG = window.CONFIG;
    var speed = 0;

    // ── MOTORCYCLE MESH ──
    var group = new THREE.Group();

    // Main body
    var bodyGeo = new THREE.BoxGeometry(2.2, 0.5, 0.9);
    var bodyMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.player });
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0;
    group.add(body);

    // Seat/fairing (slightly darker orange, top-rear)
    var seatGeo = new THREE.BoxGeometry(1.0, 0.35, 0.85);
    var seatMat = new THREE.MeshLambertMaterial({ color: 0xCC3800 });
    var seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(-0.4, 0.3, 0);
    group.add(seat);

    // Engine block
    var engineGeo = new THREE.BoxGeometry(0.7, 0.4, 0.7);
    var engineMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    var engine = new THREE.Mesh(engineGeo, engineMat);
    engine.position.set(0, -0.15, 0);
    group.add(engine);

    // Exhaust pipe (along right side)
    var exhaustGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.2, 6);
    var exhaustMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    var exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaust.rotation.z = Math.PI / 2;
    exhaust.position.set(-0.3, -0.2, 0.45);
    group.add(exhaust);

    // Front fork (angled forward)
    var forkGeo = new THREE.BoxGeometry(0.12, 1.0, 0.12);
    var forkMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
    var fork = new THREE.Mesh(forkGeo, forkMat);
    fork.rotation.z = -0.3;
    fork.position.set(0.9, 0.15, 0);
    group.add(fork);

    // Front wheel
    var fWheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.22, 12);
    var fWheelMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.playerDetail });
    var frontWheel = new THREE.Mesh(fWheelGeo, fWheelMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(1.0, -0.35, 0);
    group.add(frontWheel);

    // Back wheel
    var bWheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.22, 12);
    var bWheelMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.playerDetail });
    var backWheel = new THREE.Mesh(bWheelGeo, bWheelMat);
    backWheel.rotation.z = Math.PI / 2;
    backWheel.position.set(-0.9, -0.35, 0);
    group.add(backWheel);

    // Handlebar
    var handleGeo = new THREE.BoxGeometry(1.3, 0.08, 0.08);
    var handleMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
    var handlebar = new THREE.Mesh(handleGeo, handleMat);
    handlebar.rotation.y = Math.PI / 2;
    handlebar.position.set(0.95, 0.45, 0);
    group.add(handlebar);

    // Headlight (front of bike)
    var headlightGeo = new THREE.BoxGeometry(0.25, 0.2, 0.1);
    var headlightMat = new THREE.MeshLambertMaterial({
        color: 0xFFFFAA,
        emissive: 0xFFFFAA,
        emissiveIntensity: 2.0
    });
    var headlight = new THREE.Mesh(headlightGeo, headlightMat);
    headlight.position.set(1.15, 0.1, 0);
    group.add(headlight);

    // Headlight PointLight
    var headlightPL = new THREE.PointLight(0xFFFFAA, 1.5, 18);
    headlightPL.position.set(1.3, 0.1, 0);
    group.add(headlightPL);

    // Tail light (rear)
    var taillightGeo = new THREE.BoxGeometry(0.3, 0.15, 0.08);
    var taillightMat = new THREE.MeshLambertMaterial({
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 2.0
    });
    var taillight = new THREE.Mesh(taillightGeo, taillightMat);
    taillight.position.set(-1.15, 0.1, 0);
    group.add(taillight);

    // Position bike
    group.position.y = 0.52;
    scene.add(group);

    // ── BUILDING COLLISION ──
    function collidesWithBuilding(nx, nz) {
        var buildings = window.CITY_BUILDINGS;
        if (!buildings || !buildings.length) return false;
        for (var i = 0; i < buildings.length; i++) {
            var b = buildings[i];
            if (nx > b.minX - 0.8 && nx < b.maxX + 0.8 && nz > b.minZ - 0.8 && nz < b.maxZ + 0.8) return true;
        }
        return false;
    }

    var drowned = false;

    // ── UPDATE ──
    function update(delta, keys, waterLevel) {
        // Acceleration / braking
        if (keys['KeyW'] || keys['ArrowUp']) {
            speed += 0.018;
            if (speed > CONFIG.PLAYER_SPEED) speed = CONFIG.PLAYER_SPEED;
        } else if (keys['KeyS'] || keys['ArrowDown']) {
            speed -= 0.012;
            if (speed < -CONFIG.PLAYER_SPEED * 0.4) speed = -CONFIG.PLAYER_SPEED * 0.4;
        } else {
            speed *= 0.88;
            if (Math.abs(speed) < 0.001) speed = 0;
        }

        // Turning (only when moving)
        if (Math.abs(speed) > 0.01) {
            var turnFactor = speed / CONFIG.PLAYER_SPEED;
            if (keys['KeyA'] || keys['ArrowLeft']) {
                group.rotation.y += CONFIG.PLAYER_TURN_SPEED * turnFactor;
            }
            if (keys['KeyD'] || keys['ArrowRight']) {
                group.rotation.y -= CONFIG.PLAYER_TURN_SPEED * turnFactor;
            }
        }

        // Movement (CRITICAL — negative cosY is correct)
        var sinY = Math.sin(group.rotation.y);
        var cosY = Math.cos(group.rotation.y);
        var newX = group.position.x + sinY * speed;
        var newZ = group.position.z - cosY * speed;

        // Clamp to city bounds
        var limit = CONFIG.CITY_SIZE / 2;
        newX = Math.max(-limit, Math.min(limit, newX));
        newZ = Math.max(-limit, Math.min(limit, newZ));

        // Wall-sliding collision
        if (!collidesWithBuilding(newX, newZ)) {
            group.position.x = newX;
            group.position.z = newZ;
        } else if (!collidesWithBuilding(newX, group.position.z)) {
            group.position.x = newX;
        } else if (!collidesWithBuilding(group.position.x, newZ)) {
            group.position.z = newZ;
        }
        // else: blocked on both axes

        // Visual: wheel rotation
        frontWheel.rotation.y += speed * 2.5;
        backWheel.rotation.y += speed * 2.5;

        // Visual: bike lean when turning
        if (keys['KeyA'] || keys['ArrowLeft']) {
            group.rotation.z = speed * 0.08;
        } else if (keys['KeyD'] || keys['ArrowRight']) {
            group.rotation.z = -speed * 0.08;
        } else {
            group.rotation.z *= 0.9;
        }

        // Drowning check
        if (group.position.y <= waterLevel + 0.3) {
            drowned = true;
        }
    }

    // ── DELIVERY CHECK ──
    function checkDelivery(deliveryPoints) {
        for (var i = 0; i < deliveryPoints.length; i++) {
            var dp = deliveryPoints[i].mesh.position;
            var dx = group.position.x - dp.x;
            var dy = group.position.y - dp.y;
            var dz = group.position.z - dp.z;
            var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < 3.5) return i;
        }
        return -1;
    }

    return {
        mesh: group,
        update: update,
        get position() { return group.position; },
        get rotation() { return group.rotation.y; },
        get drowned() { return drowned; },
        checkDelivery: checkDelivery
    };
};