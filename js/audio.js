window.createAudio = function() {
    var CONFIG = window.CONFIG;

    if (typeof Howl === 'undefined') {
        return { playMusic: function(){}, stopMusic: function(){}, playDelivery: function(){}, playWarning: function(){}, playGameOver: function(){} };
    }

    var music;
    try {
        music = new Howl({
            src: ['https://opengameart.org/sites/default/files/Myst-Music.mp3'],
            loop: true,
            volume: CONFIG.AUDIO.musicVolume,
            html5: true
        });
    } catch(e) {
        music = { play: function(){}, stop: function(){} };
    }

    var delivery;
    try {
        delivery = new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA='], volume: CONFIG.AUDIO.sfxVolume });
    } catch(e) {
        delivery = { play: function(){} };
    }

    var warning;
    try {
        warning = new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA='], volume: CONFIG.AUDIO.sfxVolume });
    } catch(e) {
        warning = { play: function(){} };
    }

    var gameOver;
    try {
        gameOver = new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA='], volume: CONFIG.AUDIO.sfxVolume });
    } catch(e) {
        gameOver = { play: function(){} };
    }

    return {
        playMusic: function() { try { music.play(); } catch(e) {} },
        stopMusic: function() { try { music.stop(); } catch(e) {} },
        playDelivery: function() { try { delivery.play(); } catch(e) {} },
        playWarning: function() { try { warning.play(); } catch(e) {} },
        playGameOver: function() { try { gameOver.play(); } catch(e) {} }
    };
};
