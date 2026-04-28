document.addEventListener('DOMContentLoaded', function() {
    var CONFIG = window.CONFIG;

    // ── RENDERER ──
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // ── SCENE ──
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.COLORS.sky);

    // ── CAMERA ──
    var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 600);

    // ── INIT MODULES ──
    var city = window.createCity(scene);
    var player = window.createPlayer(scene);
    var water = window.createWater(scene);
    var ui = window.createUI();
    var audio = window.createAudio();
    var multi = window.createMultiplayer(scene);

    var deliveriesLeft = CONFIG.DELIVERY_COUNT;
    var timeRemaining = CONFIG.GAME_DURATION;
    var gameState = 'start';
    var gameStartTime = 0;

    ui.showStartScreen();

    window.onGameStart = function() {
        gameState = 'playing';
        gameStartTime = clock.getElapsedTime();
        ui.hideStartScreen();
        audio.playMusic();
        multi.connect('YOUR_RAILWAY_SERVER_URL');
    };

    // ── CAMERA SYSTEM (cinematic third-person) ──
    var cameraTarget = new THREE.Vector3();
    var cameraIdeal = new THREE.Vector3();
    var lookAtPoint = new THREE.Vector3();

    function updateCamera() {
        var angle = player.mesh.rotation.y;
        // Offset: 9 units behind bike, 3.5 units above — LOW and BEHIND
        var behindX = player.mesh.position.x - Math.sin(angle) * 9;
        var behindY = player.mesh.position.y + 3.5;
        var behindZ = player.mesh.position.z + Math.cos(angle) * 9;

        cameraIdeal.set(behindX, behindY, behindZ);
        camera.position.lerp(cameraIdeal, 0.1);

        // Look slightly ahead of the bike, not at its center
        lookAtPoint.set(
            player.mesh.position.x + Math.sin(angle) * 3,
            player.mesh.position.y + 0.8,
            player.mesh.position.z - Math.cos(angle) * 3
        );
        camera.lookAt(lookAtPoint);
    }

    // ── SKY COLOR LERP ──
    var skyStart = new THREE.Color(CONFIG.COLORS.sky);
    var skyMid = new THREE.Color(0xFF6B35);
    var skyEnd = new THREE.Color(0x0a0a1a);

    // ── GAME LOOP ──
    var clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        var delta = clock.getDelta();
        var elapsed = clock.getElapsedTime();

        if (gameState === 'playing') {
            var gameElapsed = elapsed - gameStartTime;
            timeRemaining = Math.max(0, CONFIG.GAME_DURATION - gameElapsed);
            player.update(delta, window.playerKeys, water.getLevel());
            water.update(gameElapsed);

            // UI update with compass params
            ui.update(
                timeRemaining,
                deliveriesLeft,
                water.getLevel(),
                player.mesh.position,
                player.mesh.rotation.y,
                city.deliveryPoints
            );

            multi.update(player.mesh.position, player.mesh.rotation.y);

            // Sky color transition
            var progress = Math.max(0, Math.min(1, (water.getLevel() - CONFIG.WATER_START_Y) / (CONFIG.WATER_MAX_Y - CONFIG.WATER_START_Y)));
            if (progress < 0.5) {
                scene.background.copy(skyStart).lerp(skyMid, progress * 2);
            } else {
                scene.background.copy(skyMid).lerp(skyEnd, (progress - 0.5) * 2);
            }

            // Fog color follows sky
            if (scene.fog) {
                scene.fog.color.copy(scene.background);
            }

            // Delivery check
            var idx = player.checkDelivery(city.deliveryPoints);
            if (idx >= 0) {
                scene.remove(city.deliveryPoints[idx].mesh);
                scene.remove(city.deliveryPoints[idx].light);
                city.deliveryPoints.splice(idx, 1);
                deliveriesLeft--;
                audio.playDelivery();
            }

            // Win
            if (deliveriesLeft <= 0) endGame(true);

            // Lose
            if (timeRemaining <= 0 || water.isGameOver() || player.drowned) endGame(false);
        }

        updateCamera();
        renderer.render(scene, camera);
    }

    animate();

    function endGame(won) {
        if (gameState === 'gameover') return;
        gameState = 'gameover';
        multi.disconnect();
        audio.stopMusic();
        audio.playGameOver();
        ui.showGameOver(won, CONFIG.DELIVERY_COUNT - deliveriesLeft);
    }

    // ── RESIZE ──
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
