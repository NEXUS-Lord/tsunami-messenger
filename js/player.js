window.playerKeys = {};
window.addEventListener('keydown', function(e) { window.playerKeys[e.code] = true; });
window.addEventListener('keyup', function(e) { window.playerKeys[e.code] = false; });

window.createPlayer = function(scene) {
    var CONFIG = window.CONFIG;
    var speed = 0;
    var heading = 0;
    var group = new THREE.Group();

    var orangeMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.player });
    var darkMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.playerDetail });
    var metalMat = new THREE.MeshLambertMaterial({ color: 0x6f6f6f });
    var engineMat = new THREE.MeshLambertMaterial({ color: 0x444444 });

    // Main body shell
    var bodyGeo = new THREE.BoxGeometry(1.4, 0.45, 2.3);
    var body = new THREE.Mesh(bodyGeo, orangeMat);
    group.add(body);

    // Front fairing
    var fairingGeo = new THREE.BoxGeometry(1.0, 0.55, 0.8);
    var fairing = new THREE.Mesh(fairingGeo, new THREE.MeshLambertMaterial({ color: 0xcc5a10 }));
    fairing.position.set(0, 0.08, -0.78);
    group.add(fairing);

    // Seat and courier box area
    var seatGeo = new THREE.BoxGeometry(0.95, 0.28, 0.95);
    var seat = new THREE.Mesh(seatGeo, darkMat);
    seat.position.set(0, 0.28, 0.18);
    group.add(seat);

    var cargoGeo = new THREE.BoxGeometry(0.95, 0.85, 0.85);
    var cargo = new THREE.Mesh(cargoGeo, new THREE.MeshLambertMaterial({ color: 0xd66a14 }));
    cargo.position.set(0, 0.45, 0.95);
    group.add(cargo);

    // Small rider silhouette so the bike still reads as a courier motorcycle
    var riderTorsoGeo = new THREE.BoxGeometry(0.42, 0.62, 0.3);
    var riderTorso = new THREE.Mesh(riderTorsoGeo, darkMat);
    riderTorso.position.set(0, 0.8, -0.02);
    group.add(riderTorso);

    var helmetGeo = new THREE.BoxGeometry(0.32, 0.32, 0.32);
    var helmet = new THREE.Mesh(helmetGeo, darkMat);
    helmet.position.set(0, 1.15, -0.1);
    group.add(helmet);

    var visorGeo = new THREE.BoxGeometry(0.34, 0.12, 0.08);
    var visor = new THREE.Mesh(visorGeo, new THREE.MeshLambertMaterial({ color: 0x1b1b1b, emissive: 0x091018, emissiveIntensity: 0.4 }));
    visor.position.set(0, 1.09, -0.25);
    group.add(visor);

    // Engine block
    var engineGeo = new THREE.BoxGeometry(0.52, 0.38, 0.6);
    var engine = new THREE.Mesh(engineGeo, engineMat);
    engine.position.set(0, -0.16, 0.15);
    group.add(engine);

    // Exhaust pipe
    var exhaustGeo = new THREE.CylinderGeometry(0.05, 0.07, 1.15, 6);
    exhaustGeo.rotateX(Math.PI / 2);
    var exhaust = new THREE.Mesh(exhaustGeo, metalMat);
    exhaust.position.set(0.46, -0.18, 0.42);
    group.add(exhaust);

    var exhaustTipGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.16, 6);
    exhaustTipGeo.rotateX(Math.PI / 2);
    var exhaustTip = new THREE.Mesh(exhaustTipGeo, darkMat);
    exhaustTip.position.set(0.58, -0.18, 0.95);
    group.add(exhaustTip);

    // Front fork
    var forkGeo = new THREE.BoxGeometry(0.1, 0.95, 0.1);
    var fork = new THREE.Mesh(forkGeo, metalMat);
    fork.rotation.x = 0.18;
    fork.position.set(0, 0.08, -1.0);
    group.add(fork);

    // Wheels — proper cylindrical tires read better from the chase camera
    var tireGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.22, 14);
    tireGeo.rotateZ(Math.PI / 2);
    var frontWheel = new THREE.Mesh(tireGeo, darkMat);
    frontWheel.position.set(0, -0.36, -1.08);
    group.add(frontWheel);

    var backWheel = new THREE.Mesh(tireGeo, darkMat);
    backWheel.position.set(0, -0.36, 1.0);
    group.add(backWheel);

    var rearHubGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.24, 10);
    rearHubGeo.rotateZ(Math.PI / 2);
    var rearHub = new THREE.Mesh(rearHubGeo, metalMat);
    rearHub.position.set(0, -0.36, 1.0);
    group.add(rearHub);

    // Handlebar
    var handleGeo = new THREE.BoxGeometry(1.1, 0.07, 0.07);
    var handlebar = new THREE.Mesh(handleGeo, metalMat);
    handlebar.position.set(0, 0.5, -0.92);
    group.add(handlebar);

    var handleStemGeo = new THREE.BoxGeometry(0.08, 0.32, 0.08);
    var handleStem = new THREE.Mesh(handleStemGeo, metalMat);
    handleStem.rotation.x = 0.25;
    handleStem.position.set(0, 0.3, -0.92);
    group.add(handleStem);

    // Headlight
    var hlGeo = new THREE.BoxGeometry(0.24, 0.2, 0.12);
    var hlMat = new THREE.MeshLambertMaterial({ color: 0xFFFFAA, emissive: 0xFFFFAA, emissiveIntensity: 2.0 });
    var headlight = new THREE.Mesh(hlGeo, hlMat);
    headlight.position.set(0, 0.12, -1.12);
    group.add(headlight);
    var hlLight = new THREE.PointLight(0xFFFFAA, 1.5, 18);
    hlLight.position.set(0, 0.15, -1.35);
    group.add(hlLight);

    // Tail light
    var tlGeo = new THREE.BoxGeometry(0.3, 0.14, 0.08);
    var tlMat = new THREE.MeshLambertMaterial({ color: 0xFF0000, emissive: 0xFF0000, emissiveIntensity: 2.0 });
    var taillight = new THREE.Mesh(tlGeo, tlMat);
    taillight.position.set(0, 0.14, 1.18);
    group.add(taillight);

    var rearReflectorGeo = new THREE.BoxGeometry(0.18, 0.06, 0.03);
    var rearReflector = new THREE.Mesh(rearReflectorGeo, new THREE.MeshLambertMaterial({ color: 0x4a0000, emissive: 0x220000, emissiveIntensity: 0.6 }));
    rearReflector.position.set(0, 0.06, 1.26);
    group.add(rearReflector);

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
    var frontWheelSteer = 0;
    var wheelbase = 2.0; // Distance between front and rear axles

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

        // Front wheel steering angle (Ackermann steering)
        var targetSteer = 0;
        if (Math.abs(speed) > 0.01) {
            if (keys['KeyA'] || keys['ArrowLeft']) targetSteer = 0.35;
                        if (keys['KeyA'] || keys['ArrowLeft']) targetSteer = 0.4;
            if (keys['KeyD'] || keys['ArrowRight']) targetSteer = -0.35;
                    if (keys['KeyD'] || keys['ArrowRight']) targetSteer = -0.4;
        }
        frontWheelSteer += (targetSteer - frontWheelSteer) * 0.15;

        // Ackermann steering: heading changes based on turn radius, not instantly
        if (Math.abs(speed) > 0.01 && Math.abs(frontWheelSteer) > 0.01) {
            var turnRadius = wheelbase / Math.sin(frontWheelSteer);
            heading += speed / turnRadius;
        }

        var sinY = Math.sin(heading);
        var cosY = Math.cos(heading);
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
        var lean = group.rotation.z;
        if (keys['KeyA'] || keys['ArrowLeft']) {
            lean = Math.min(0.18, speed * 0.14);
        } else if (keys['KeyD'] || keys['ArrowRight']) {
            lean = Math.max(-0.18, -speed * 0.14);
        } else {
            lean *= 0.82;
        }
        group.rotation.set(0, heading, lean);

        frontWheel.rotation.x += speed * 3.5;
        frontWheel.rotation.y = frontWheelSteer;
        backWheel.rotation.x += speed * 3.5;
        rearHub.rotation.x += speed * 3.5;

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
        get rotation() { return heading; },
        get drowned() { return drowned; },
        checkDelivery: checkDelivery
    };
};