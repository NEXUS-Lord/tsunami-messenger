window.createMultiplayer = function(scene) {
    var CONFIG = window.CONFIG;
    var socket = null;
    var connected = false;
    var playerId = Math.random().toString(36).substr(2, 9);
    var ghosts = {};
    var ghostCount = 0;
    var sendInterval = null;
    var currentPos = { x: 0, y: 0, z: 0 };
    var currentRot = 0;

    function createGhostMesh() {
        var group = new THREE.Group();

        // Body
        var bodyGeo = new THREE.BoxGeometry(2.2, 0.5, 0.9);
        var bodyMat = new THREE.MeshLambertMaterial({ color: 0xFF6600, transparent: true, opacity: 0.45 });
        var body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        // Front wheel
        var fWheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.22, 12);
        var fWheelMat = new THREE.MeshLambertMaterial({ color: 0x222222, transparent: true, opacity: 0.45 });
        var fWheel = new THREE.Mesh(fWheelGeo, fWheelMat);
        fWheel.rotation.z = Math.PI / 2;
        fWheel.position.set(1.0, -0.35, 0);
        group.add(fWheel);

        // Back wheel
        var bWheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.22, 12);
        var bWheelMat = new THREE.MeshLambertMaterial({ color: 0x222222, transparent: true, opacity: 0.45 });
        var bWheel = new THREE.Mesh(bWheelGeo, bWheelMat);
        bWheel.rotation.z = Math.PI / 2;
        bWheel.position.set(-0.9, -0.35, 0);
        group.add(bWheel);

        group.position.y = 0.52;
        return group;
    }

    function updateGhosts(players) {
        if (!players) return;

        var activeIds = {};

        for (var i = 0; i < players.length; i++) {
            var p = players[i];
            if (p.id === playerId) continue;

            activeIds[p.id] = true;

            if (ghosts[p.id]) {
                // Update existing ghost target
                ghosts[p.id].targetPos.set(p.x, p.y, p.z);
                ghosts[p.id].targetRot = p.rotation;
            } else if (ghostCount < 8) {
                // Create new ghost
                var mesh = createGhostMesh();
                mesh.position.set(p.x, p.y, p.z);
                scene.add(mesh);
                ghosts[p.id] = {
                    group: mesh,
                    targetPos: new THREE.Vector3(p.x, p.y, p.z),
                    targetRot: p.rotation || 0
                };
                ghostCount++;
            }
        }

        // Remove missing ghosts
        var ids = Object.keys(ghosts);
        for (var j = 0; j < ids.length; j++) {
            var id = ids[j];
            if (!activeIds[id]) {
                scene.remove(ghosts[id].group);
                delete ghosts[id];
                ghostCount--;
            }
        }
    }

    function connect(serverUrl) {
        if (typeof io === 'undefined') {
            connected = false;
            return;
        }

        try {
            socket = io(serverUrl, {
                transports: ['websocket'],
                reconnection: false,
                timeout: 3000
            });

            socket.on('connect', function() {
                connected = true;
            });

            socket.on('players:update', function(players) {
                updateGhosts(players);
            });

            socket.on('connect_error', function() {
                connected = false;
            });

            socket.on('disconnect', function() {
                connected = false;
            });

            sendInterval = setInterval(function() {
                if (connected && socket) {
                    try {
                        socket.emit('player:move', {
                            id: playerId,
                            x: currentPos.x,
                            y: currentPos.y,
                            z: currentPos.z,
                            rotation: currentRot
                        });
                    } catch(e) {}
                }
            }, 100);
        } catch(e) {
            connected = false;
        }
    }

    function update(position, rotationY) {
        if (position) {
            currentPos.x = position.x;
            currentPos.y = position.y;
            currentPos.z = position.z;
        }
        currentRot = rotationY || 0;

        // Lerp ghosts toward targets
        var ids = Object.keys(ghosts);
        for (var i = 0; i < ids.length; i++) {
            var g = ghosts[ids[i]];
            g.group.position.lerp(g.targetPos, 0.15);

            // Lerp rotation
            var diff = g.targetRot - g.group.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            g.group.rotation.y += diff * 0.15;
        }
    }

    function disconnect() {
        if (sendInterval) {
            clearInterval(sendInterval);
            sendInterval = null;
        }

        // Remove all ghosts from scene
        var ids = Object.keys(ghosts);
        for (var i = 0; i < ids.length; i++) {
            scene.remove(ghosts[ids[i]].group);
        }
        ghosts = {};
        ghostCount = 0;

        try {
            if (socket) socket.disconnect();
        } catch(e) {}
        connected = false;
    }

    return {
        connect: connect,
        update: update,
        disconnect: disconnect
    };
};