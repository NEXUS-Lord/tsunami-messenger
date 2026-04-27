(function() {
    'use strict';

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
        var halfSize = CONFIG.CITY_SIZE / 2;

        // --- Motorcycle mesh ---
        var group = new THREE.Group();

        // Body
        var bodyGeo = new THREE.BoxGeometry(2, 0.6, 1);
        var bodyMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.player });
        var body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.set(0, 0, 0);
        group.add(body);

        // Front wheel
        var wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8);
        var wheelMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        var frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
        frontWheel.rotation.z = Math.PI / 2;
        frontWheel.position.set(0.9, -0.3, 0);
        group.add(frontWheel);

        // Back wheel
        var backWheel = new THREE.Mesh(wheelGeo, wheelMat);
        backWheel.rotation.z = Math.PI / 2;
        backWheel.position.set(-0.9, -0.3, 0);
        group.add(backWheel);

        // Handlebar
        var handleGeo = new THREE.BoxGeometry(1.4, 0.1, 0.1);
        var handleMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        var handlebar = new THREE.Mesh(handleGeo, handleMat);
        handlebar.position.set(0.9, 0.45, 0);
        group.add(handlebar);

        group.position.y = 0.5;
        scene.add(group);

        var player = {
            mesh: group,
            drowned: false,

            get position() {
                return group.position;
            },

            get rotation() {
                return group.rotation.y;
            },

            update: function(delta, keys, waterLevel) {
                var accel = 0.15;
                var decel = 0.92;

                // Acceleration
                if (keys['ArrowUp'] || keys['KeyW']) {
                    speed += (CONFIG.PLAYER_SPEED - speed) * accel * delta * 60;
                } else if (keys['ArrowDown'] || keys['KeyS']) {
                    var reverseMax = CONFIG.PLAYER_SPEED * 0.5;
                    speed += (-reverseMax - speed) * accel * delta * 60;
                } else {
                    speed *= Math.pow(decel, delta * 60);
                    if (Math.abs(speed) < 0.001) speed = 0;
                }

                // Turning
                if (Math.abs(speed) > 0.01) {
                    var turnFactor = CONFIG.PLAYER_TURN_SPEED * (speed / CONFIG.PLAYER_SPEED);
                    if (keys['ArrowLeft'] || keys['KeyA']) {
                        group.rotation.y += turnFactor * delta * 60;
                    }
                    if (keys['ArrowRight'] || keys['KeyD']) {
                        group.rotation.y -= turnFactor * delta * 60;
                    }
                }

                // Movement
                group.position.x += Math.sin(group.rotation.y) * speed;
                group.position.z += Math.cos(group.rotation.y) * speed;

                // Clamp
                group.position.x = Math.max(-halfSize, Math.min(halfSize, group.position.x));
                group.position.z = Math.max(-halfSize, Math.min(halfSize, group.position.z));

                // Wheel spin
                var spinRate = speed * 5;
                frontWheel.rotation.x += spinRate;
                backWheel.rotation.x += spinRate;

                // Drown check
                if (group.position.y <= waterLevel + 0.3) {
                    this.drowned = true;
                }
            },

            checkDelivery: function(deliveryPoints) {
                var px = group.position.x;
                var py = group.position.y;
                var pz = group.position.z;

                for (var i = 0; i < deliveryPoints.length; i++) {
                    var dp = deliveryPoints[i].mesh.position;
                    var dx = px - dp.x;
                    var dy = py - dp.y;
                    var dz = pz - dp.z;
                    var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (dist < 3) {
                        return i;
                    }
                }
                return -1;
            }
        };

        return player;
    };
})();
