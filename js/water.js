window.createWater = function(scene) {
    var CONFIG = window.CONFIG;

    // ── LAYER 1 — Base (deep ocean) ──
    var layer1Geo = new THREE.PlaneGeometry(500, 500, 1, 1);
    var layer1Mat = new THREE.MeshLambertMaterial({
        color: 0x0D3B5E,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide
    });
    var layer1 = new THREE.Mesh(layer1Geo, layer1Mat);
    layer1.rotation.x = -Math.PI / 2;
    layer1.position.y = CONFIG.WATER_START_Y;
    layer1.position.z = -50;
    scene.add(layer1);

    // ── LAYER 2 — Main animated surface ──
    var layer2Geo = new THREE.PlaneGeometry(400, 400, 24, 24);
    var layer2Mat = new THREE.MeshLambertMaterial({
        color: CONFIG.COLORS.water,
        transparent: true,
        opacity: 0.82,
        side: THREE.DoubleSide
    });
    var layer2 = new THREE.Mesh(layer2Geo, layer2Mat);
    layer2.rotation.x = -Math.PI / 2;
    layer2.position.y = CONFIG.WATER_START_Y;
    layer2.position.z = -40;
    scene.add(layer2);

    // Store base Y values for wave animation
    var layer2Pos = layer2Geo.attributes.position;
    var baseY = new Float32Array(layer2Pos.count);
    for (var i = 0; i < layer2Pos.count; i++) {
        baseY[i] = layer2Pos.getY(i);
    }

    // ── LAYER 3 — Foam/surface highlight ──
    var layer3Geo = new THREE.PlaneGeometry(400, 400, 8, 8);
    var layer3Mat = new THREE.MeshLambertMaterial({
        color: 0xAED6F1,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
    });
    var layer3 = new THREE.Mesh(layer3Geo, layer3Mat);
    layer3.rotation.x = -Math.PI / 2;
    layer3.position.y = CONFIG.WATER_START_Y + 0.15;
    layer3.position.z = -35;
    scene.add(layer3);

    // ── WAVE WALL (vertical — the approaching tsunami wall) ──
    var wallGeo = new THREE.PlaneGeometry(CONFIG.CITY_SIZE * 2, 20, 1, 8);
    var wallMat = new THREE.MeshLambertMaterial({
        color: 0x1A5276,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    var wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.z = -CONFIG.CITY_SIZE / 2 + 10;
    wallMesh.position.y = CONFIG.WATER_START_Y + 10;
    scene.add(wallMesh);

    // Store wall base vertex Y values
    var wallPos = wallGeo.attributes.position;
    var wallBaseY = new Float32Array(wallPos.count);
    for (var wi = 0; wi < wallPos.count; wi++) {
        wallBaseY[wi] = wallPos.getY(wi);
    }

    // ── LIGHTS ──
    var underwaterGlow = new THREE.PointLight(0x0066CC, 3, 120);
    underwaterGlow.position.set(0, CONFIG.WATER_START_Y, -30);
    scene.add(underwaterGlow);

    var distantShimmer = new THREE.PointLight(0x00AAFF, 1.5, 60);
    distantShimmer.position.set(0, CONFIG.WATER_START_Y + 2, -80);
    scene.add(distantShimmer);

    // ── UPDATE ──
    function update(elapsed) {
        // 1. Rise all 3 flat layers
        if (layer1.position.y < CONFIG.WATER_MAX_Y) {
            layer1.position.y += CONFIG.WATER_RISE_RATE;
        }
        if (layer2.position.y < CONFIG.WATER_MAX_Y) {
            layer2.position.y += CONFIG.WATER_RISE_RATE;
        }
        if (layer3.position.y < CONFIG.WATER_MAX_Y) {
            layer3.position.y += CONFIG.WATER_RISE_RATE;
        }

        // 2. Rise wave wall (slower for dramatic effect)
        wallMesh.position.y += CONFIG.WATER_RISE_RATE * 0.3;

        // 3. Animate layer 2 vertices (wave surface)
        var positions = layer2Geo.attributes.position;
        for (var i = 0; i < positions.count; i++) {
            var vx = positions.getX(i);
            var vz = positions.getZ(i);
            var localY = baseY[i] + Math.sin(elapsed * 1.8 + vx * 0.25) * 0.35 + Math.cos(elapsed * 1.3 + vz * 0.25) * 0.2;
            positions.setY(i, localY);
        }
        positions.needsUpdate = true;

        // 4. Animate wave wall vertices (vertical undulation)
        var wPositions = wallGeo.attributes.position;
        for (var j = 0; j < wPositions.count; j++) {
            var wx = wPositions.getX(j);
            var wy = wallBaseY[j] + Math.sin(elapsed + wx * 0.1) * 2;
            wPositions.setY(j, wy);
        }
        wPositions.needsUpdate = true;

        // 5. Update glow light positions
        underwaterGlow.position.y = layer2.position.y - 1;
        distantShimmer.position.y = layer2.position.y + 1;
    }

    // ── GETTERS ──
    function getLevel() {
        return layer2.position.y;
    }

    function isGameOver() {
        return layer2.position.y >= CONFIG.WATER_MAX_Y;
    }

    return {
        update: update,
        getLevel: getLevel,
        isGameOver: isGameOver
    };
};