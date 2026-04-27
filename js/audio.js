(function() {
    'use strict';
    window.createAudio = function() {
        var noop = function() {};
        var api = { playMusic: noop, stopMusic: noop, playDelivery: noop, playWarning: noop, playGameOver: noop };
        try {
            if (typeof Howl === 'undefined') return api;
            var c = window.CONFIG && window.CONFIG.AUDIO ? window.CONFIG.AUDIO : { musicVolume: 0.5, sfxVolume: 0.8 };
            var m = new Howl({ src: ['https://opengameart.org/sites/default/files/Myst-Music.mp3'], loop: true, volume: c.musicVolume, html5: true });
            var d = new Howl({ src: ['https://actions.google.com/sounds/v1/alarms/beep_short.ogg'], volume: c.sfxVolume });
            var w = new Howl({ src: ['https://actions.google.com/sounds/v1/alarms/warning_alarm_loop.ogg'], volume: c.sfxVolume });
            var g = new Howl({ src: ['https://actions.google.com/sounds/v1/impacts/crash.ogg'], volume: c.sfxVolume });
            api.playMusic = function() { m.play(); };
            api.stopMusic = function() { m.stop(); };
            api.playDelivery = function() { d.play(); };
            api.playWarning = function() { w.play(); };
            api.playGameOver = function() { g.play(); };
        } catch (e) {
            console.warn('Audio disabled:', e);
        }
        return api;
    };
})();
