///<reference path="lib/soundjs/soundjs.d.ts"/>

// For compilation in Windows with tsconfig.json use> tsc.cmd
var timeline: djs.Timeline;

window.onload = () => {

    // Check that we can play audio
    if ( !createjs.Sound.initializeDefaultPlugins() ) {
        alert( 'Error initializing audio plugins' );
        return;
    }

    timeline = new djs.Timeline();
    timeline.onResize();
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

window.addEventListener( "resize", () => {
    console.log( "resize: " + window.innerWidth + " " + window.innerHeight );
    timeline.onResize();
} );
