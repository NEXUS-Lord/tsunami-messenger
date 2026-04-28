window.createCity = function(scene) {
    var CONFIG = window.CONFIG;
    var halfSize = CONFIG.CITY_SIZE / 2;
    var buildings = [];
    var roads = [];
    var trees = [];
    var deliveryPoints = [];

    window.CITY_BUILDINGS = [];

    // ── LIGHTING (cinematic sunset look) ──
    var hemiLight = new THREE.HemisphereLight(0xFFE4B5, 0x2C3E50, 0.6);
    scene.add(hemiLight);

    var dirLight = new THREE.DirectionalLight(0xFF6B35, 1.1);
    dirLight.position.set(80, 100, 60);
    dirLight.castShadow = true;
    scene.add(dirLight);

    var ambLight = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambLight);

    scene.fog = new THREE.Fog(0xB0C4DE, 50, 160);

    // ── GROUND ──
    var groundGeo = new THREE.BoxGeometry(CONFIG.CITY_SIZE, 0.1, CONFIG.CITY_SIZE);
    var groundMat = new THREE.MeshLambertMaterial({ color: 0x2A2A2A });
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.05;
    scene.add(ground);

    // ── COASTAL OCEAN (visual) ──
    var oceanGeo = new THREE.BoxGeometry(CONFIG.CITY_SIZE, 0.5, 60);
    var oceanMat = new THREE.MeshLambertMaterial({ color: 0x1A3A5C });
    var ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.position.set(0, -0.3, -halfSize - 30);
    scene.add(ocean);

    // ── ROADS (4x4 grid) ──
    var roadCount = 4;
    var roadWidth = CONFIG.ROAD_WIDTH;
    var spacing = CONFIG.CITY_SIZE / (roadCount + 1);

    // Horizontal roads (along X axis)
    for (var i = 1; i <= roadCount; i++) {
        var rz = -halfSize + spacing * i;
        var roadGeo = new THREE.BoxGeometry(CONFIG.CITY_SIZE, 0.05, roadWidth);
        var roadMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.road });
        var roadMesh = new THREE.Mesh(roadGeo, roadMat);
        roadMesh.position.set(0, 0.01, rz);
        scene.add(roadMesh);
        roads.push(roadMesh);

        // Lane markings (dashed white lines)
        for (var lx = -halfSize; lx < halfSize; lx += 12) {
            var lineGeo = new THREE.BoxGeometry(8, 0.06, 0.3);
            var lineMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.roadLine });
            var lineMesh = new THREE.Mesh(lineGeo, lineMat);
            lineMesh.position.set(lx + 4, 0.04, rz);
            scene.add(lineMesh);
        }
    }

    // Vertical roads (along Z axis)
    for (var j = 1; j <= roadCount; j++) {
        var rx = -halfSize + spacing * j;
        var roadGeo2 = new THREE.BoxGeometry(roadWidth, 0.05, CONFIG.CITY_SIZE);
        var roadMat2 = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.road });
        var roadMesh2 = new THREE.Mesh(roadGeo2, roadMat2);
        roadMesh2.position.set(rx, 0.01, 0);
        scene.add(roadMesh2);
        roads.push(roadMesh2);

        // Lane markings (dashed white lines)
        for (var lz = -halfSize; lz < halfSize; lz += 12) {
            var lineGeo2 = new THREE.BoxGeometry(0.3, 0.06, 8);
            var lineMat2 = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.roadLine });
            var lineMesh2 = new THREE.Mesh(lineGeo2, lineMat2);
            lineMesh2.position.set(rx, 0.04, lz + 4);
            scene.add(lineMesh2);
        }
    }

    // Road position arrays for collision checks
    var roadPositionsH = [];
    for (var ri = 1; ri <= roadCount; ri++) {
        roadPositionsH.push(-halfSize + spacing * ri);
    }
    var roadPositionsV = [];
    for (var rj = 1; rj <= roadCount; rj++) {
        roadPositionsV.push(-halfSize + spacing * rj);
    }

    function isOnRoad(x, z) {
        for (var r = 0; r < roadPositionsH.length; r++) {
            if (Math.abs(z - roadPositionsH[r]) < roadWidth / 2 + 1) return true;
        }
        for (var r2 = 0; r2 < roadPositionsV.length; r2++) {
            if (Math.abs(x - roadPositionsV[r2]) < roadWidth / 2 + 1) return true;
        }
        return false;
    }

    // ── BUILDINGS ──
    var neonColors = [CONFIG.COLORS.neon1, CONFIG.COLORS.neon2, CONFIG.COLORS.neon3];
    var neonIndex = 0;

    for (var bi = 0; bi < CONFIG.BUILDING_COUNT; bi++) {
        var bWidth = 4 + Math.random() * 8;
        var bDepth = 4 + Math.random() * 8;
        var bHeight = 3 + Math.random() * 15;

        // Place along road edges
        var bx, bz;
        var placed = false;
        for (var attempt = 0; attempt < 30; attempt++) {
            bx = (Math.random() - 0.5) * CONFIG.CITY_SIZE * 0.9;
            bz = (Math.random() - 0.5) * CONFIG.CITY_SIZE * 0.9;

            // Skip coastal zone
            if (bz < -80) continue;

            // Must not be on road
            if (isOnRoad(bx, bz)) continue;

            placed = true;
            break;
        }
        if (!placed) continue;

        // Clamp to city bounds
        bx = Math.max(-halfSize + bWidth / 2, Math.min(halfSize - bWidth / 2, bx));
        bz = Math.max(-halfSize + bDepth / 2, Math.min(halfSize - bDepth / 2, bz));

        // Color with per-building HSL variation
        var baseColor = new THREE.Color(CONFIG.COLORS.building);
        var hsl = {};
        baseColor.getHSL(hsl);
        hsl.l += (Math.random() - 0.5) * 0.16;
        hsl.h += (Math.random() - 0.5) * 0.04;
        baseColor.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l)));

        var bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
        var bMat = new THREE.MeshLambertMaterial({ color: baseColor });
        var bMesh = new THREE.Mesh(bGeo, bMat);
        bMesh.position.set(bx, bHeight / 2, bz);
        scene.add(bMesh);
        buildings.push(bMesh);

        // Building collision data (CRITICAL)
        window.CITY_BUILDINGS.push({
            minX: bx - bWidth / 2,
            maxX: bx + bWidth / 2,
            minZ: bz - bDepth / 2,
            maxZ: bz + bDepth / 2
        });

        // Neon signs on 60% of buildings
        if (Math.random() < 0.6) {
            var signGeo = new THREE.BoxGeometry(bWidth * 0.6, 0.4, 0.12);
            var neonColor = neonColors[neonIndex % neonColors.length];
            neonIndex++;
            var signMat = new THREE.MeshLambertMaterial({
                color: neonColor,
                emissive: neonColor,
                emissiveIntensity: 1.5
            });
            var signMesh = new THREE.Mesh(signGeo, signMat);
            signMesh.position.set(bx, bHeight * 0.7, bz + bDepth / 2 + 0.07);
            scene.add(signMesh);

            var neonLight = new THREE.PointLight(neonColor, 0.8, 12);
            neonLight.position.set(bx, bHeight * 0.7, bz + bDepth / 2 + 0.2);
            scene.add(neonLight);
        }
    }

    // ── TREES (30 total) ──
    for (var ti = 0; ti < 30; ti++) {
        var tx = (Math.random() - 0.5) * CONFIG.CITY_SIZE * 0.85;
        var tz = (Math.random() - 0.5) * CONFIG.CITY_SIZE * 0.85;

        // Skip roads and coastal zone
        if (isOnRoad(tx, tz)) continue;
        if (tz < -80) continue;

        var canopyGeo = new THREE.ConeGeometry(1.8, 3, 6);
        var canopyMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.tree });
        var canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(tx, 3.5, tz);
        scene.add(canopy);

        var trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 2, 6);
        var trunkMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.treeTrunk });
        var trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(tx, 1, tz);
        scene.add(trunk);

        trees.push(canopy);
        trees.push(trunk);
    }

    // ── DELIVERY POINTS ──
    for (var di = 0; di < CONFIG.DELIVERY_COUNT; di++) {
        var dx, dz;
        var dplaced = false;
        for (var da = 0; da < 50; da++) {
            dx = (Math.random() - 0.5) * CONFIG.CITY_SIZE * 0.8;
            dz = (Math.random() - 0.5) * CONFIG.CITY_SIZE * 0.7;

            if (isOnRoad(dx, dz)) continue;
            if (dz < -80) continue;

            dplaced = true;
            break;
        }
        if (!dplaced) {
            dx = (Math.random() - 0.5) * 60;
            dz = (Math.random() - 0.5) * 60;
        }

        // Flat disc
        var discGeo = new THREE.CylinderGeometry(2, 2, 0.15, 16);
        var discMat = new THREE.MeshLambertMaterial({
            color: CONFIG.COLORS.marker,
            emissive: CONFIG.COLORS.marker,
            emissiveIntensity: 0.5
        });
        var discMesh = new THREE.Mesh(discGeo, discMat);
        discMesh.position.set(dx, 0.08, dz);
        scene.add(discMesh);

        // Glow light above
        var dLight = new THREE.PointLight(CONFIG.COLORS.markerGlow, 2.5, 20);
        dLight.position.set(dx, 6, dz);
        scene.add(dLight);

        // Vertical beacon pole
        var poleGeo = new THREE.BoxGeometry(0.2, 6, 0.2);
        var poleMat = new THREE.MeshLambertMaterial({
            color: CONFIG.COLORS.marker,
            emissive: CONFIG.COLORS.marker,
            emissiveIntensity: 0.8
        });
        var poleMesh = new THREE.Mesh(poleGeo, poleMat);
        poleMesh.position.set(dx, 3, dz);
        scene.add(poleMesh);

        deliveryPoints.push({ mesh: discMesh, light: dLight });
    }

    return {
        buildings: buildings,
        roads: roads,
        trees: trees,
        deliveryPoints: deliveryPoints
    };
};