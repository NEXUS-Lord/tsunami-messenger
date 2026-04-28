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
    var camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 600);
    camera.position.set(20, 4, 29);

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
    var cameraIdeal = new THREE.Vector3();
    var lookAtPoint = new THREE.Vector3();
    var cameraBackOffset = new THREE.Vector3(0, 3.5, 9);
    var cameraLookOffset = new THREE.Vector3(0, 0.9, -4);
    var firstFrame = true;

    function updateCamera() {
        // Use the bike's current rotation directly so the camera stays pinned to the rear
        var angle = player.mesh.rotation.y;
        var sine = Math.sin(angle);
        var cosine = Math.cos(angle);

        cameraIdeal.set(
            player.mesh.position.x - sine * cameraBackOffset.z + cameraBackOffset.x,
            player.mesh.position.y + cameraBackOffset.y,
            player.mesh.position.z + cosine * cameraBackOffset.z
        );

        if (firstFrame) {
            camera.position.copy(cameraIdeal);
            firstFrame = false;
        } else {
            // higher lerp so camera closely follows the bike rear
            camera.position.lerp(cameraIdeal, 0.35);
        }

        // Look a bit ahead of the bike so the player sees the road
        lookAtPoint.set(
            player.mesh.position.x + Math.sin(angle) * Math.abs(cameraLookOffset.z),
            player.mesh.position.y + cameraLookOffset.y,
            player.mesh.position.z - Math.cos(angle) * Math.abs(cameraLookOffset.z)
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
