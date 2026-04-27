window.createMultiplayer = function(scene) {
  let socket = null;
  let connected = false;
  let playerId = Math.random().toString(36).substr(2, 9);
  let intervalId = null;
  let currentPosition = { x: 0, y: 0, z: 0 };
  let currentRotation = 0;
  const ghosts = new Map();

  function createGhostMesh() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xFF6600, transparent: true, opacity: 0.5 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 1), bodyMat);
    group.add(body);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x333333, transparent: true, opacity: 0.5 });
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8);
    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, -0.3, 0.6);
    group.add(frontWheel);
    const backWheel = new THREE.Mesh(wheelGeo, wheelMat);
    backWheel.rotation.z = Math.PI / 2;
    backWheel.position.set(0, -0.3, -0.6);
    group.add(backWheel);
    return group;
  }

  function updateGhosts(players) {
    const activeIds = new Set();
    for (const p of players) {
      if (p.id === playerId) continue;
      activeIds.add(p.id);
      if (!ghosts.has(p.id)) {
        if (ghosts.size >= 8) continue;
        const group = createGhostMesh();
        scene.add(group);
        ghosts.set(p.id, {
          group,
          targetPos: new THREE.Vector3(p.x, p.y, p.z),
          targetRot: p.rotation
        });
      } else {
        const ghost = ghosts.get(p.id);
        ghost.targetPos.set(p.x, p.y, p.z);
        ghost.targetRot = p.rotation;
      }
    }
    for (const [id, ghost] of ghosts) {
      if (!activeIds.has(id)) {
        scene.remove(ghost.group);
        ghosts.delete(id);
      }
    }
  }

  function connect(serverUrl) {
    try {
      socket = io(serverUrl, { transports: ['websocket'], reconnection: false });
      socket.on('connect', function() {
        connected = true;
        intervalId = setInterval(function() {
          if (connected) {
            socket.emit('player:move', {
              id: playerId,
              x: currentPosition.x,
              y: currentPosition.y,
              z: currentPosition.z,
              rotation: currentRotation
            });
          }
        }, 100);
      });
      socket.on('players:update', function(players) {
        updateGhosts(players);
      });
      socket.on('connect_error', function() {
        connected = false;
      });
    } catch(e) {
      connected = false;
    }
  }

  function update(position, rotationY) {
    currentPosition.x = position.x;
    currentPosition.y = position.y;
    currentPosition.z = position.z;
    currentRotation = rotationY;
    for (const ghost of ghosts.values()) {
      ghost.group.position.lerp(ghost.targetPos, 0.15);
      ghost.group.rotation.y += (ghost.targetRot - ghost.group.rotation.y) * 0.15;
    }
  }

  function disconnect() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    for (const ghost of ghosts.values()) {
      scene.remove(ghost.group);
    }
    ghosts.clear();
    if (socket && connected) {
      socket.disconnect();
    }
    connected = false;
  }

  return { connect, update, disconnect };
};