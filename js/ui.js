window.onGameStart = null;

window.createUI = function() {
    var CONFIG = window.CONFIG;
    var overlay = document.getElementById('ui-overlay');

    // ── START SCREEN ──
    var startScreen = document.createElement('div');
    startScreen.id = 'start-screen';
    startScreen.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(ellipse at center,rgba(10,20,40,0.97) 0%,rgba(0,0,0,0.99) 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:200;pointer-events:all;';

    var jpText = document.createElement('div');
    jpText.textContent = '津波メッセンジャー';
    jpText.style.cssText = 'color:#87CEEB;font-size:1.1rem;letter-spacing:0.3em;font-family:inherit;';
    startScreen.appendChild(jpText);

    var title = document.createElement('div');
    title.textContent = 'TSUNAMI MESSENGER';
    title.style.cssText = 'font-size:3rem;font-weight:900;color:#FFFFFF;letter-spacing:0.1em;font-family:inherit;';
    startScreen.appendChild(title);

    var emoji = document.createElement('div');
    emoji.textContent = '🌊';
    emoji.style.cssText = 'font-size:3rem;';
    startScreen.appendChild(emoji);

    var subtitle = document.createElement('div');
    subtitle.textContent = 'Deliver evacuation notices before the wave hits';
    subtitle.style.cssText = 'color:#AAB8C2;font-size:1rem;font-family:inherit;';
    startScreen.appendChild(subtitle);

    var controls = document.createElement('div');
    controls.textContent = '[ WASD ] Move   [ ↑↓←→ ] Alternative';
    controls.style.cssText = 'color:#666;font-size:0.85rem;font-family:inherit;';
    startScreen.appendChild(controls);

    var startBtn = document.createElement('button');
    startBtn.textContent = 'START MISSION';
    startBtn.style.cssText = 'background:linear-gradient(135deg,#CC0000,#FF2200);color:white;font-weight:900;font-size:1.3rem;padding:16px 48px;border:none;border-radius:3px;cursor:pointer;letter-spacing:0.15em;font-family:inherit;pointer-events:all;';
    startBtn.addEventListener('click', function() {
        if (typeof window.onGameStart === 'function') {
            window.onGameStart();
        }
    });
    startScreen.appendChild(startBtn);

    overlay.appendChild(startScreen);

    // ── HUD ──

    // Timer (top-left)
    var timerPanel = document.createElement('div');
    timerPanel.id = 'timer-panel';
    timerPanel.className = 'ui-panel hidden';
    timerPanel.style.cssText = 'position:absolute;top:20px;left:20px;font-size:1.2rem;';
    timerPanel.textContent = '⏱ 03:00';
    overlay.appendChild(timerPanel);

    // Delivery count (top-right)
    var deliveryPanel = document.createElement('div');
    deliveryPanel.id = 'delivery-panel';
    deliveryPanel.className = 'ui-panel hidden';
    deliveryPanel.style.cssText = 'position:absolute;top:20px;right:20px;font-size:1.1rem;';
    deliveryPanel.textContent = '📦 6 left';
    overlay.appendChild(deliveryPanel);

    // Wave bar (bottom)
    var waveBarContainer = document.createElement('div');
    waveBarContainer.id = 'wave-bar-container';
    waveBarContainer.className = 'hidden';
    waveBarContainer.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:40px;background:rgba(0,0,0,0.8);display:flex;align-items:center;padding:0 20px;gap:12px;';

    var waveLabel = document.createElement('div');
    waveLabel.textContent = '🌊 WAVE';
    waveLabel.style.cssText = 'color:#1A6B8A;font-size:0.8rem;letter-spacing:0.1em;font-family:inherit;';
    waveBarContainer.appendChild(waveLabel);

    var waveTrack = document.createElement('div');
    waveTrack.style.cssText = 'flex:1;height:8px;background:#1a1a1a;border-radius:4px;overflow:hidden;';

    var waveFill = document.createElement('div');
    waveFill.id = 'wave-fill';
    waveFill.style.cssText = 'height:100%;background:linear-gradient(90deg,#1A5276,#1A6B8A,#AED6F1);border-radius:4px;width:0%;';
    waveTrack.appendChild(waveFill);
    waveBarContainer.appendChild(waveTrack);

    var wavePct = document.createElement('div');
    wavePct.id = 'wave-pct';
    wavePct.textContent = '0%';
    wavePct.style.cssText = 'color:#AED6F1;font-size:0.8rem;min-width:40px;text-align:right;font-family:inherit;';
    waveBarContainer.appendChild(wavePct);

    overlay.appendChild(waveBarContainer);

    // Wave warning (top-center)
    var waveWarning = document.createElement('div');
    waveWarning.id = 'wave-warning';
    waveWarning.className = 'pulse hidden';
    waveWarning.textContent = '⚠  WAVE INCOMING  ⚠';
    waveWarning.style.cssText = 'position:absolute;top:80px;left:50%;transform:translateX(-50%);color:#FF2200;font-size:1.1rem;font-weight:bold;letter-spacing:0.2em;font-family:inherit;';
    overlay.appendChild(waveWarning);

    // ── COMPASS ARROW (center-bottom, above wave bar) ──
    var compassContainer = document.createElement('div');
    compassContainer.id = 'compass-container';
    compassContainer.className = 'hidden';
    compassContainer.style.cssText = 'position:absolute;bottom:60px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none;';

    var compassLabel = document.createElement('div');
    compassLabel.textContent = '📦 NEAREST';
    compassLabel.style.cssText = 'color:rgba(255,215,0,0.7);font-size:0.65rem;letter-spacing:0.15em;font-family:inherit;';
    compassContainer.appendChild(compassLabel);

    var compassArrow = document.createElement('div');
    compassArrow.id = 'compass-arrow';
    compassArrow.style.cssText = 'width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;transition:transform 0.15s ease-out;filter:drop-shadow(0 0 6px rgba(255,215,0,0.6));';
    compassArrow.textContent = '▲';
    compassArrow.style.color = '#FFD700';
    compassContainer.appendChild(compassArrow);

    var compassDist = document.createElement('div');
    compassDist.id = 'compass-dist';
    compassDist.textContent = '0m';
    compassDist.style.cssText = 'color:rgba(255,215,0,0.8);font-size:0.7rem;font-family:inherit;letter-spacing:0.05em;';
    compassContainer.appendChild(compassDist);

    overlay.appendChild(compassContainer);

    // ── GAME OVER SCREEN ──
    var gameoverScreen = document.createElement('div');
    gameoverScreen.id = 'gameover-screen';
    gameoverScreen.className = 'hidden';
    gameoverScreen.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(ellipse at center,rgba(10,20,40,0.97) 0%,rgba(0,0,0,0.99) 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:200;pointer-events:all;';
    overlay.appendChild(gameoverScreen);

    // ── METHODS ──

    function showStartScreen() {
        startScreen.classList.remove('hidden');
    }

    function hideStartScreen() {
        startScreen.classList.add('hidden');
        timerPanel.classList.remove('hidden');
        deliveryPanel.classList.remove('hidden');
        waveBarContainer.classList.remove('hidden');
        compassContainer.classList.remove('hidden');
    }

    function update(timeRemaining, deliveriesLeft, waterLevel, playerPos, playerRotY, deliveryPoints) {
        // Timer
        var mins = Math.floor(timeRemaining / 60);
        var secs = Math.floor(timeRemaining % 60);
        var timeStr = '⏱ ' + (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
        timerPanel.textContent = timeStr;
        timerPanel.style.color = timeRemaining < 30 ? '#FF4444' : '#ffffff';

        // Deliveries
        deliveryPanel.textContent = '📦 ' + deliveriesLeft + ' left';

        // Wave bar
        var progress = (waterLevel - CONFIG.WATER_START_Y) / (CONFIG.WATER_MAX_Y - CONFIG.WATER_START_Y);
        progress = Math.max(0, Math.min(1, progress));
        waveFill.style.width = (progress * 100) + '%';
        wavePct.textContent = Math.floor(progress * 100) + '%';

        // Wave warning
        if (waterLevel > -2) {
            waveWarning.classList.remove('hidden');
        } else {
            waveWarning.classList.add('hidden');
        }

        // Compass arrow — point toward nearest delivery
        if (playerPos && deliveryPoints && deliveryPoints.length > 0) {
            var nearestDist = Infinity;
            var nearestAngle = 0;
            for (var i = 0; i < deliveryPoints.length; i++) {
                var dp = deliveryPoints[i].mesh.position;
                var dx = dp.x - playerPos.x;
                var dz = dp.z - playerPos.z;
                var dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    // atan2 gives world angle from player to delivery
                    nearestAngle = Math.atan2(dx, -dz);
                }
            }
            // Subtract player rotation to make it camera-relative
            var relativeAngle = nearestAngle - (playerRotY || 0);
            // Convert to degrees for CSS
            var degrees = relativeAngle * (180 / Math.PI);
            compassArrow.style.transform = 'rotate(' + degrees + 'deg)';
            compassDist.textContent = Math.floor(nearestDist) + 'm';

            compassContainer.classList.remove('hidden');
        } else if (!deliveryPoints || deliveryPoints.length === 0) {
            compassContainer.classList.add('hidden');
        }
    }

    function showGameOver(won, deliveriesMade) {
        // Hide HUD
        timerPanel.classList.add('hidden');
        deliveryPanel.classList.add('hidden');
        waveBarContainer.classList.add('hidden');
        waveWarning.classList.add('hidden');
        compassContainer.classList.add('hidden');

        // Build game over content
        gameoverScreen.innerHTML = '';

        var resultEmoji = document.createElement('div');
        resultEmoji.style.cssText = 'font-size:3rem;';
        resultEmoji.textContent = won ? '🌊' : '💀';
        gameoverScreen.appendChild(resultEmoji);

        var resultTitle = document.createElement('div');
        resultTitle.style.cssText = 'font-size:2.2rem;font-weight:900;letter-spacing:0.1em;font-family:inherit;';
        if (won) {
            resultTitle.textContent = 'MISSION COMPLETE';
            resultTitle.style.color = '#27AE60';
        } else {
            resultTitle.textContent = 'CITY FLOODED';
            resultTitle.style.color = '#CC0000';
        }
        gameoverScreen.appendChild(resultTitle);

        var resultSub = document.createElement('div');
        resultSub.style.cssText = 'font-size:1rem;color:#AAB8C2;font-family:inherit;';
        resultSub.textContent = won ? 'All residents evacuated!' : 'The wave claimed the city.';
        gameoverScreen.appendChild(resultSub);

        var deliveryInfo = document.createElement('div');
        deliveryInfo.style.cssText = 'font-size:1.1rem;color:#ffffff;font-family:inherit;margin-top:10px;';
        deliveryInfo.textContent = 'Deliveries: ' + deliveriesMade + ' / ' + CONFIG.DELIVERY_COUNT;
        gameoverScreen.appendChild(deliveryInfo);

        var replayBtn = document.createElement('button');
        replayBtn.textContent = 'PLAY AGAIN';
        replayBtn.style.cssText = 'background:linear-gradient(135deg,#CC0000,#FF2200);color:white;font-weight:900;font-size:1.3rem;padding:16px 48px;border:none;border-radius:3px;cursor:pointer;letter-spacing:0.15em;font-family:inherit;pointer-events:all;margin-top:10px;';
        replayBtn.addEventListener('click', function() {
            window.location.reload();
        });
        gameoverScreen.appendChild(replayBtn);

        gameoverScreen.classList.remove('hidden');
    }

    return {
        update: update,
        showGameOver: showGameOver,
        showStartScreen: showStartScreen,
        hideStartScreen: hideStartScreen
    };
};
