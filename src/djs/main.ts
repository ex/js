///<reference path="lib/soundjs/soundjs.d.ts"/>

// For compilation in Windows use> tsc.cmd main.ts
var timeline: djs.Timeline;

window.onload = () => {

    // Check that we can play audio
    if ( !createjs.Sound.initializeDefaultPlugins() ) {
        alert( 'Error initializing audio plugins' );
        return;
    }

    var timeline: djs.Timeline = new djs.Timeline( 'content' );
    timeline.load( 'media/natali/', 'hombre_mar.json' );

    var oldTime = Date.now();
    var update = function() {

        var newTime = Date.now();
        var timeDelta = newTime - oldTime;
        oldTime = newTime;
        timeline.update( timeDelta );

        window.requestAnimationFrame( update );
    }
    update();
};

window.onresize = () => {
    if ( timeline ) {
        timeline.onResize( window.innerWidth, window.innerHeight );
    }
}
