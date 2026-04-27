(function() {
    'use strict';

    window.createCity = function(scene) {
        var CONFIG = window.CONFIG;
        var halfSize = CONFIG.CITY_SIZE / 2;
        var buildings = [];
        var roads = [];
        var trees = [];
        var deliveryPoints = [];

        // --- Lighting ---
        var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        var dirLight = new THREE.DirectionalLight(0xffeedd, 0.9);
        dirLight.position.set(50, 80, 50);
        scene.add(dirLight);

        // --- Fog ---
        scene.fog = new THREE.Fog(CONFIG.COLORS.fog, 40, 130);

        // --- Ground plane ---
        var groundGeo = new THREE.BoxGeometry(CONFIG.CITY_SIZE, 0.1, CONFIG.CITY_SIZE);
        var groundMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
        var ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.set(0, -0.05, 0);
        scene.add(ground);

        // --- Roads (4x4 grid) ---
        var roadCount = 4;
        var roadWidth = 4;
        var spacing = CONFIG.CITY_SIZE / (roadCount + 1);

        for (var i = 1; i <= roadCount; i++) {
            // Horizontal roads (along X axis)
            var hGeo = new THREE.BoxGeometry(CONFIG.CITY_SIZE, 0.05, roadWidth);
            var hMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.road });
            var hRoad = new THREE.Mesh(hGeo, hMat);
            var hz = -halfSize + i * spacing;
            hRoad.position.set(0, 0.02, hz);
            scene.add(hRoad);
            roads.push(hRoad);

            // Vertical roads (along Z axis)
            var vGeo = new THREE.BoxGeometry(roadWidth, 0.05, CONFIG.CITY_SIZE);
            var vMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.road });
            var vRoad = new THREE.Mesh(vGeo, vMat);
            var vx = -halfSize + i * spacing;
            vRoad.position.set(vx, 0.02, 0);
            scene.add(vRoad);
            roads.push(vRoad);
        }

        // --- Helper: check if position is on a road ---
        function isOnRoad(x, z) {
            for (var i = 1; i <= roadCount; i++) {
                var center = -halfSize + i * spacing;
                if (Math.abs(z - center) < roadWidth * 0.7) return true;
                if (Math.abs(x - center) < roadWidth * 0.7) return true;
            }
            return false;
        }

        // --- Helper: check coastal zone ---
        function isCoastal(z) {
            return z < -80;
        }

        // --- Buildings ---
        for (var b = 0; b < CONFIG.BUILDING_COUNT; b++) {
            var bWidth = 4 + Math.random() * 8;
            var bDepth = 4 + Math.random() * 8;
            var bHeight = 3 + Math.random() * 12;

            // Place along road edges
            var roadIndex = Math.floor(Math.random() * roadCount) + 1;
            var roadCenter = -halfSize + roadIndex * spacing;
            var side = Math.random() < 0.5 ? -1 : 1;
            var alongRoad = Math.random() < 0.5;

            var bx, bz;
            if (alongRoad) {
                // Building alongside a vertical road
                bx = roadCenter + side * (roadWidth * 0.5 + bWidth * 0.5 + 1);
                bz = -halfSize + Math.random() * CONFIG.CITY_SIZE;
            } else {
                // Building alongside a horizontal road
                bx = -halfSize + Math.random() * CONFIG.CITY_SIZE;
                bz = roadCenter + side * (roadWidth * 0.5 + bDepth * 0.5 + 1);
            }

            // Skip coastal zone
            if (isCoastal(bz)) continue;

            // Clamp to city bounds
            bx = Math.max(-halfSize + bWidth, Math.min(halfSize - bWidth, bx));
            bz = Math.max(-halfSize + bDepth, Math.min(halfSize - bDepth, bz));

            // Color variation
            var baseColor = new THREE.Color(CONFIG.COLORS.building);
            var hsl = {};
            baseColor.getHSL(hsl);
            hsl.l = Math.max(0.1, Math.min(0.9, hsl.l + (Math.random() - 0.5) * 0.15));
            hsl.h = hsl.h + (Math.random() - 0.5) * 0.03;
            baseColor.setHSL(hsl.h, hsl.s, hsl.l);

            var bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
            var bMat = new THREE.MeshLambertMaterial({ color: baseColor });
            var bMesh = new THREE.Mesh(bGeo, bMat);
            bMesh.position.set(bx, bHeight / 2, bz);
            scene.add(bMesh);
            buildings.push(bMesh);
            window.CITY_BUILDINGS = window.CITY_BUILDINGS || [];
            window.CITY_BUILDINGS.push({
                minX: bx - bWidth / 2,
                maxX: bx + bWidth / 2,
                minZ: bz - bDepth / 2,
                maxZ: bz + bDepth / 2
            });
        }

        // --- Trees ---
        var treeMat_canopy = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
        var treeMat_trunk = new THREE.MeshLambertMaterial({ color: 0x4a3728 });

        for (var t = 0; t < 30; t++) {
            var tx = -halfSize + Math.random() * CONFIG.CITY_SIZE;
            var tz = -halfSize + Math.random() * CONFIG.CITY_SIZE;

            // Avoid roads and coastal zone
            if (isOnRoad(tx, tz) || isCoastal(tz)) {
                t--;
                continue;
            }

            var trunkHeight = 1.5 + Math.random() * 1.5;
            var canopyHeight = 2 + Math.random() * 2;
            var canopyRadius = 1.5 + Math.random() * 1;

            // Trunk
            var trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, trunkHeight, 6);
            var trunk = new THREE.Mesh(trunkGeo, treeMat_trunk);
            trunk.position.set(tx, trunkHeight / 2, tz);
            scene.add(trunk);

            // Canopy
            var canopyGeo = new THREE.ConeGeometry(canopyRadius, canopyHeight, 6);
            var canopy = new THREE.Mesh(canopyGeo, treeMat_canopy);
            canopy.position.set(tx, trunkHeight + canopyHeight / 2, tz);
            scene.add(canopy);

            var treeGroup = new THREE.Group();
            treeGroup.userData.trunk = trunk;
            treeGroup.userData.canopy = canopy;
            trees.push(treeGroup);
        }

        // --- Delivery Points ---
        for (var d = 0; d < CONFIG.DELIVERY_COUNT; d++) {
            var dx, dz;
            var attempts = 0;
            do {
                dx = -halfSize + Math.random() * CONFIG.CITY_SIZE;
                dz = -halfSize + Math.random() * CONFIG.CITY_SIZE;
                attempts++;
            } while ((isCoastal(dz) || isOnRoad(dx, dz)) && attempts < 100);

            var discGeo = new THREE.CylinderGeometry(2, 2, 0.2, 16);
            var discMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.marker });
            var discMesh = new THREE.Mesh(discGeo, discMat);
            discMesh.position.set(dx, 0.1, dz);
            scene.add(discMesh);

            var dLight = new THREE.PointLight(0xffff00, 1.5, 15);
            dLight.position.set(dx, 5, dz);
            scene.add(dLight);

            deliveryPoints.push({ mesh: discMesh, light: dLight });
        }

        return {
            buildings: buildings,
            roads: roads,
            trees: trees,
            deliveryPoints: deliveryPoints
        };
    };
})();