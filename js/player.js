window.playerKeys = {};
window.addEventListener('keydown', function(e) { window.playerKeys[e.code] = true; });
window.addEventListener('keyup', function(e) { window.playerKeys[e.code] = false; });

window.createPlayer = function(scene) {
    var CONFIG = window.CONFIG;
    var speed = 0;
    var group = new THREE.Group();

    // Body (narrow like a real motorcycle, long along Z)
    var bodyGeo = new THREE.BoxGeometry(0.4, 0.45, 2.0);
    var body = new THREE.Mesh(bodyGeo, new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.player }));
    group.add(body);

    // Fuel tank (top-center, rounded look)
    var tankGeo = new THREE.BoxGeometry(0.5, 0.3, 0.8);
    var tank = new THREE.Mesh(tankGeo, new THREE.MeshLambertMaterial({ color: 0xCC3800 }));
    tank.position.set(0, 0.3, -0.2);
    group.add(tank);

    // Rider torso
    var torsoGeo = new THREE.BoxGeometry(0.45, 0.7, 0.4);
    var torso = new THREE.Mesh(torsoGeo, new THREE.MeshLambertMaterial({ color: 0x222222 }));
    torso.position.set(0, 0.75, 0.1);
    group.add(torso);

    // Rider head (helmet)
    var headGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    var head = new THREE.Mesh(headGeo, new THREE.MeshLambertMaterial({ color: 0x333333 }));
    head.position.set(0, 1.25, 0.0);
    group.add(head);

    // Helmet visor
    var visorGeo = new THREE.BoxGeometry(0.36, 0.15, 0.1);
    var visor = new THREE.Mesh(visorGeo, new THREE.MeshLambertMaterial({ color: 0x1A5276, emissive: 0x1A5276, emissiveIntensity: 0.5 }));
    visor.position.set(0, 1.22, -0.18);
    group.add(visor);

    // Engine block
    var engineGeo = new THREE.BoxGeometry(0.5, 0.35, 0.6);
    var engine = new THREE.Mesh(engineGeo, new THREE.MeshLambertMaterial({ color: 0x555555 }));
    engine.position.set(0, -0.15, 0);
    group.add(engine);

    // Exhaust pipe
    var exhaustGeo = new THREE.CylinderGeometry(0.05, 0.07, 1.0, 6);
    exhaustGeo.rotateX(Math.PI / 2);
    var exhaust = new THREE.Mesh(exhaustGeo, new THREE.MeshLambertMaterial({ color: 0x888888 }));
    exhaust.position.set(0.3, -0.2, 0.4);
    group.add(exhaust);

    // Front fork
    var forkGeo = new THREE.BoxGeometry(0.08, 0.9, 0.08);
    var fork = new THREE.Mesh(forkGeo, new THREE.MeshLambertMaterial({ color: 0x666666 }));
    fork.rotation.x = 0.25;
    fork.position.set(0, 0.1, -0.85);
    group.add(fork);

    // Wheels — SphereGeometry looks correct from every angle, no rotation issues
    var frontWheel = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 12, 8),
        new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.playerDetail })
    );
    frontWheel.position.set(0, -0.35, -1.0);
    frontWheel.scale.set(0.5, 1, 1); // Squash sideways to look like a tire
    group.add(frontWheel);

    var backWheel = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 12, 8),
        new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.playerDetail })
    );
    backWheel.position.set(0, -0.35, 0.85);
    backWheel.scale.set(0.5, 1, 1); // Squash sideways
    group.add(backWheel);

    // Handlebar
    var handleGeo = new THREE.BoxGeometry(0.9, 0.06, 0.06);
    var handlebar = new THREE.Mesh(handleGeo, new THREE.MeshLambertMaterial({ color: 0x999999 }));
    handlebar.position.set(0, 0.45, -0.9);
    group.add(handlebar);

    // Headlight
    var hlGeo = new THREE.BoxGeometry(0.18, 0.18, 0.08);
    var hlMat = new THREE.MeshLambertMaterial({ color: 0xFFFFAA, emissive: 0xFFFFAA, emissiveIntensity: 2.0 });
    var headlight = new THREE.Mesh(hlGeo, hlMat);
    headlight.position.set(0, 0.15, -1.1);
    group.add(headlight);
    var hlLight = new THREE.PointLight(0xFFFFAA, 1.5, 18);
    hlLight.position.set(0, 0.15, -1.3);
    group.add(hlLight);

    // Tail light
    var tlGeo = new THREE.BoxGeometry(0.25, 0.12, 0.06);
    var tlMat = new THREE.MeshLambertMaterial({ color: 0xFF0000, emissive: 0xFF0000, emissiveIntensity: 2.0 });
    var taillight = new THREE.Mesh(tlGeo, tlMat);
    taillight.position.set(0, 0.15, 1.1);
    group.add(taillight);

    // Spawn at road intersection
    group.position.set(20, 0.52, 20);
    scene.add(group);

    // Safety spawn check
    setTimeout(function() {
        var blds = window.CITY_BUILDINGS;
        if (!blds) return;
        for (var si = 0; si < blds.length; si++) {
            var b = blds[si];
            if (group.position.x > b.minX - 1.5 && group.position.x < b.maxX + 1.5 &&
                group.position.z > b.minZ - 1.5 && group.position.z < b.maxZ + 1.5) {
                group.position.set(-20, 0.52, -20);
                break;
            }
        }
    }, 0);

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

    function update(delta, keys, waterLevel) {
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

        if (Math.abs(speed) > 0.01) {
            var turnFactor = speed / CONFIG.PLAYER_SPEED;
            if (keys['KeyA'] || keys['ArrowLeft']) group.rotation.y += CONFIG.PLAYER_TURN_SPEED * turnFactor;
            if (keys['KeyD'] || keys['ArrowRight']) group.rotation.y -= CONFIG.PLAYER_TURN_SPEED * turnFactor;
        }

        var sinY = Math.sin(group.rotation.y);
        var cosY = Math.cos(group.rotation.y);
        var newX = group.position.x + sinY * speed;
        var newZ = group.position.z - cosY * speed;
        var limit = CONFIG.CITY_SIZE / 2;
        newX = Math.max(-limit, Math.min(limit, newX));
        newZ = Math.max(-limit, Math.min(limit, newZ));

        if (!collidesWithBuilding(newX, newZ)) {
            group.position.x = newX;
            group.position.z = newZ;
        } else if (!collidesWithBuilding(newX, group.position.z)) {
            group.position.x = newX;
        } else if (!collidesWithBuilding(group.position.x, newZ)) {
            group.position.z = newZ;
        }

        // Lean when turning
        if (keys['KeyA'] || keys['ArrowLeft']) {
            group.rotation.z = speed * 0.12;
        } else if (keys['KeyD'] || keys['ArrowRight']) {
            group.rotation.z = -speed * 0.12;
        } else {
            group.rotation.z *= 0.85;
        }

        if (group.position.y <= waterLevel + 0.3) drowned = true;
    }

    function checkDelivery(deliveryPoints) {
        for (var i = 0; i < deliveryPoints.length; i++) {
            var dp = deliveryPoints[i].mesh.position;
            var dx = group.position.x - dp.x;
            var dy = group.position.y - dp.y;
            var dz = group.position.z - dp.z;
            if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 3.5) return i;
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