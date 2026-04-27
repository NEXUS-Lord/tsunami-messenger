(function() {
    'use strict';

    window.onGameStart = null;

    window.createUI = function() {
        var CONFIG = window.CONFIG;
        var overlay = document.getElementById('ui-overlay');

        // Inject styles for pulse animation and layout
        var style = document.createElement('style');
        style.textContent = 
            "@keyframes pulseWarning { 0% { opacity: 1; } 50% { opacity: 0.2; } 100% { opacity: 1; } } " +
            ".warning-pulse { animation: pulseWarning 1s infinite; } " +
            ".fullscreen-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.88); z-index: 200; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; } " +
            ".hud-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; } " +
            ".hud-top-left { position: absolute; top: 20px; left: 20px; pointer-events: auto; } " +
            ".hud-top-right { position: absolute; top: 20px; right: 20px; pointer-events: auto; } " +
            ".hud-bottom { position: absolute; bottom: 0; left: 0; width: 100%; display: flex; align-items: center; padding: 10px 20px; background: rgba(0,0,0,0.5); pointer-events: auto; } " +
            ".warning-text { position: absolute; top: 60px; left: 50%; transform: translateX(-50%); color: red; font-size: 1.5rem; font-weight: bold; } " +
            ".action-btn { background: #CC0000; color: white; font-weight: bold; font-size: 1.4rem; padding: 14px 40px; border: none; cursor: pointer; border-radius: 2px; margin-top: 30px; pointer-events: auto; font-family: inherit; }";
        document.head.appendChild(style);

        // Start Screen
        var startScreen = document.createElement('div');
        startScreen.className = 'fullscreen-overlay';
        startScreen.innerHTML = 
            "<div style='color: white; font-size: 1rem; margin-bottom: 5px;'>津波メッセンジャー</div>" +
            "<h1 style='color: white; font-size: 3rem; margin: 0 0 10px 0;'>TSUNAMI MESSENGER 🌊</h1>" +
            "<div style='color: white; font-size: 1.2rem; margin-bottom: 20px;'>Deliver evacuation notices before the wave hits</div>" +
            "<div style='color: #aaa; font-size: 0.9rem; margin-bottom: 30px;'>[ WASD ] or [ &uarr;&darr;&larr;&rarr; ] to ride</div>" +
            "<button class='action-btn' id='start-btn'>START</button>";

        // Game Over Screen
        var gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'fullscreen-overlay hidden';
        
        // HUD
        var hudContainer = document.createElement('div');
        hudContainer.className = 'hud-container hidden';
        
        var timerDisplay = document.createElement('div');
        timerDisplay.className = 'ui-panel hud-top-left';
        timerDisplay.innerHTML = '⏱ 03:00';
        
        var deliveryDisplay = document.createElement('div');
        deliveryDisplay.className = 'ui-panel hud-top-right';
        deliveryDisplay.innerHTML = '📦 ' + CONFIG.DELIVERY_COUNT + ' left';
        
        var warningText = document.createElement('div');
        warningText.className = 'warning-text warning-pulse hidden';
        warningText.innerHTML = '⚠ WAVE INCOMING ⚠';
        
        var bottomBarContainer = document.createElement('div');
        bottomBarContainer.className = 'hud-bottom';
        bottomBarContainer.innerHTML = 
            "<div style='color: white; font-weight: bold; margin-right: 15px;'>🌊 WAVE</div>" +
            "<div style='flex-grow: 1; height: 8px; background: #333; border-radius: 4px; overflow: hidden;'>" +
                "<div id='water-fill' style='width: 0%; height: 100%; background: #1A6B8A; transition: width 0.2s;'></div>" +
            "</div>";
        
        hudContainer.appendChild(timerDisplay);
        hudContainer.appendChild(deliveryDisplay);
        hudContainer.appendChild(warningText);
        hudContainer.appendChild(bottomBarContainer);
        
        overlay.appendChild(startScreen);
        overlay.appendChild(hudContainer);
        overlay.appendChild(gameOverScreen);

        document.getElementById('start-btn').addEventListener('click', function() {
            if (typeof window.onGameStart === 'function') {
                window.onGameStart();
            }
        });

        var waterFill = document.getElementById('water-fill');

        return {
            showStartScreen: function() {
                startScreen.classList.remove('hidden');
                hudContainer.classList.add('hidden');
                gameOverScreen.classList.add('hidden');
            },
            
            hideStartScreen: function() {
                startScreen.classList.add('hidden');
                hudContainer.classList.remove('hidden');
            },
            
            update: function(timeRemaining, deliveriesLeft, waterLevel) {
                // Timer
                var mins = Math.floor(timeRemaining / 60);
                var secs = Math.floor(timeRemaining % 60);
                var timeStr = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
                timerDisplay.innerHTML = '⏱ ' + timeStr;
                
                if (timeRemaining < 30) {
                    timerDisplay.style.color = 'red';
                } else {
                    timerDisplay.style.color = '#ffffff';
                }
                
                // Deliveries
                deliveryDisplay.innerHTML = '📦 ' + deliveriesLeft + ' left';
                
                // Water Bar
                var waterRange = CONFIG.WATER_MAX_Y - CONFIG.WATER_START_Y;
                var currentWater = Math.max(0, waterLevel - CONFIG.WATER_START_Y);
                var fillPercent = Math.min(100, Math.max(0, (currentWater / waterRange) * 100));
                waterFill.style.width = fillPercent + '%';
                
                // Warning text
                if (waterLevel > -2) {
                    warningText.classList.remove('hidden');
                } else {
                    warningText.classList.add('hidden');
                }
            },
            
            showGameOver: function(won, deliveriesMade) {
                hudContainer.classList.add('hidden');
                
                var titleColor = won ? '#4CAF50' : '#CC0000';
                var titleText = won ? '🌊 MISSION COMPLETE' : '💀 CITY FLOODED';
                var subText = won ? 'All residents evacuated!' : 'The wave claimed the city.';
                
                gameOverScreen.innerHTML = 
                    "<h1 style='color: " + titleColor + "; font-size: 3rem; margin: 0 0 10px 0;'>" + titleText + "</h1>" +
                    "<div style='color: white; font-size: 1.2rem; margin-bottom: 20px;'>" + subText + "</div>" +
                    "<div style='color: white; font-size: 1.1rem; margin-bottom: 30px;'>Deliveries: " + deliveriesMade + " / " + CONFIG.DELIVERY_COUNT + "</div>" +
                    "<button class='action-btn' id='restart-btn'>PLAY AGAIN</button>";
                
                document.getElementById('restart-btn').addEventListener('click', function() {
                    window.location.reload();
                });
                
                gameOverScreen.classList.remove('hidden');
            }
        };
    };
})();
