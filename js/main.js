(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        var CONFIG = window.CONFIG;

        // --- Renderer ---
        var container = document.getElementById('game-container');
        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        // --- Scene ---
        var scene = new THREE.Scene();
        scene.background = new THREE.Color(CONFIG.COLORS.sky);

        // --- Camera ---
        var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);

        // --- Initialize modules ---
        var city = window.createCity(scene);
        var player = window.createPlayer(scene);
        var water = window.createWater(scene);
        var ui = window.createUI();
        var audio = window.createAudio();
        var multi = window.createMultiplayer(scene);

        var deliveriesLeft = CONFIG.DELIVERY_COUNT;
        var timeRemaining = CONFIG.GAME_DURATION;
        var gameState = 'start';

        ui.showStartScreen();

        // --- Start callback ---
        window.onGameStart = function() {
            gameState = 'playing';
            ui.hideStartScreen();
            audio.playMusic();
            multi.connect('YOUR_RAILWAY_SERVER_URL');
        };

        // --- Sky colors for lerp ---
        var skyStart = new THREE.Color(0x87CEEB);
        var skyEnd = new THREE.Color(0x0a0a1a);

        // --- Camera follow helper ---
        var cameraOffset = new THREE.Vector3(0, 6, 10);
        var desiredPos = new THREE.Vector3();

        function updateCamera() {
            var angle = player.mesh.rotation.y;
            desiredPos.set(
                player.mesh.position.x - Math.sin(angle) * 10,
                player.mesh.position.y + 5,
                player.mesh.position.z - Math.cos(angle) * 10 + 3
            );
            camera.position.lerp(desiredPos, 0.1);
            var lookTarget = new THREE.Vector3(
                player.mesh.position.x,
                player.mesh.position.y + 1,
                player.mesh.position.z
            );
            camera.lookAt(lookTarget);
        }

        // --- End game ---
        function endGame(won) {
            gameState = 'gameover';
            multi.disconnect();
            audio.stopMusic();
            audio.playGameOver();
            ui.showGameOver(won, CONFIG.DELIVERY_COUNT - deliveriesLeft);
        }

        // --- Game loop ---
        var clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            var delta = clock.getDelta();
            var elapsed = clock.getElapsedTime();

            if (gameState === 'playing') {
                timeRemaining = Math.max(0, timeRemaining - delta);

                player.update(delta, window.playerKeys, water.getLevel());
                water.update(elapsed);
                ui.update(timeRemaining, deliveriesLeft, water.getLevel());
                multi.update(player.mesh.position, player.mesh.rotation.y);

                // Sky color shift
                var waterRange = CONFIG.WATER_MAX_Y - CONFIG.WATER_START_Y;
                var progress = Math.max(0, Math.min(1, (water.getLevel() - CONFIG.WATER_START_Y) / waterRange));
                scene.background.copy(skyStart).lerp(skyEnd, progress);

                // Delivery check
                var idx = player.checkDelivery(city.deliveryPoints);
                if (idx >= 0) {
                    scene.remove(city.deliveryPoints[idx].mesh);
                    scene.remove(city.deliveryPoints[idx].light);
                    city.deliveryPoints.splice(idx, 1);
                    deliveriesLeft--;
                    audio.playDelivery();
                }

                // Win condition
                if (deliveriesLeft <= 0) {
                    endGame(true);
                }

                // Lose conditions
                if (timeRemaining <= 0 || water.isGameOver() || player.drowned) {
                    endGame(false);
                }
            }

            updateCamera();
            renderer.render(scene, camera);
        }

        animate();

        // --- Window resize ---
        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    });
})();
