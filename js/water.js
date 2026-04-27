(function() {
    'use strict';

    window.createWater = function(scene) {
        var CONFIG = window.CONFIG;

        // --- Water plane ---
        var geometry = new THREE.PlaneGeometry(400, 400, 20, 20);
        var material = new THREE.MeshLambertMaterial({
            color: CONFIG.COLORS.water,
            transparent: true,
            opacity: 0.78,
            side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = CONFIG.WATER_START_Y;
        scene.add(mesh);

        // --- Underwater glow ---
        var glowLight = new THREE.PointLight(0x0044ff, 2, 80);
        glowLight.position.set(0, CONFIG.WATER_START_Y - 1, 0);
        scene.add(glowLight);

        // Store original vertex positions for wave offset
        var posAttr = geometry.attributes.position;
        var vertexCount = posAttr.count;

        return {
            update: function(elapsed) {
                // Rise
                if (mesh.position.y < CONFIG.WATER_MAX_Y) {
                    mesh.position.y += CONFIG.WATER_RISE_RATE;
                    if (mesh.position.y > CONFIG.WATER_MAX_Y) {
                        mesh.position.y = CONFIG.WATER_MAX_Y;
                    }
                }

                // Wave animation on vertices
                for (var i = 0; i < vertexCount; i++) {
                    var vx = posAttr.getX(i);
                    var vz = posAttr.getZ(i);
                    var vy = Math.sin(elapsed * 1.5 + vx * 0.3) * 0.25 +
                             Math.cos(elapsed * 1.2 + vz * 0.3) * 0.15;
                    posAttr.setY(i, vy);
                }
                posAttr.needsUpdate = true;

                // Update glow light position
                glowLight.position.y = mesh.position.y - 1;
            },

            getLevel: function() {
                return mesh.position.y;
            },

            isGameOver: function() {
                return mesh.position.y >= CONFIG.WATER_MAX_Y;
            }
        };
    };
})();
