
goog.provide( 'DrawTweet.start' );

goog.require( 'goog.object' );
goog.require( 'goog.ui.Component.EventType' );
goog.require( 'goog.ui.Select' );
goog.require( 'goog.ui.Textarea' );

var ctx;
var canvasWidth;
var canvasHeight;
var textRed;
var textGreen;
var textBlue;

function red( i, j ) {
    return 255;
}
function green( i, j ) {
    return 255;
}
function blue( i, j ) {
    return 255;
}
function hexColor( c ) {
    return ( c > 16 ) ? c.toString( 16 ) : ( c > 0 ) ? '0' + c.toString( 16 ) : '00';
}

function redraw() {
    var i, j;
    var canvasData = ctx.getImageData( 0, 0, canvasWidth, canvasHeight );

    if ( canvasData ) {
        for ( j = 0; j < canvasHeight; j++ ) {
            for ( i = 0; i < canvasWidth; i++ ) {
                var index = ( i + j * canvasWidth ) * 4;
                canvasData.data[index + 0] = red( 2 * i, 2 * j ) & 255;
                canvasData.data[index + 1] = green( 2 * i, 2 * j ) & 255;
                canvasData.data[index + 2] = blue( 2 * i, 2 * j ) & 255;
                canvasData.data[index + 3] = 255;
            }
        }
        ctx.putImageData( canvasData, 0, 0 );
    }
    else {
        for ( j = 0; j < canvasHeight; j++ ) {
            for ( i = 0; i < canvasWidth; i++ ) {
                ctx.fillStyle = '#' + hexColor( red( i, j ) ) + hexColor( green( i, j ) )
                                    + hexColor( blue( i, j ) );
                ctx.fillRect( i, j, 1, 1 );
            }
        }
    }
}

function onSelectEquation( index ) {
    red = redFunctions[index];
    green = greenFunctions[index];
    blue = blueFunctions[index];

    textRed.setContent( red.toString() );
    textGreen.setContent( green.toString() );
    textBlue.setContent( blue.toString() );

    redraw();
}

DrawTweet.start = function () {

    var minHeight = 100;
    textRed = new goog.ui.Textarea();
    textRed.setMinHeight( minHeight );
    textRed.decorate( goog.dom.getElement( 'textRed' ) );

    textGreen = new goog.ui.Textarea();
    textGreen.setMinHeight( minHeight );
    textGreen.decorate( goog.dom.getElement( 'textGreen' ) );

    textBlue = new goog.ui.Textarea();
    textBlue.setMinHeight( minHeight );
    textBlue.decorate( goog.dom.getElement( 'textBlue' ) );

    var canvas = document.getElementById( "canvas" );
    if ( canvas ) {
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        DIM = 2 * Math.min( canvasWidth, canvasHeight );
        if ( canvas.getContext ) {
            ctx = canvas.getContext( "2d" );
            onSelectEquation( 0 );
        }
    }

    var selectEquations = new goog.ui.Select();
    for ( var k = 0; k < nameFunctions.length; k++ ) {
        selectEquations.addItem( new goog.ui.MenuItem( nameFunctions[k] ) );
    }
    selectEquations.render( goog.dom.getElement( 'selectEquations' ) );
    selectEquations.setSelectedIndex( 0 );

    goog.events.listen( selectEquations, goog.ui.Component.EventType.ACTION,
        function ( e ) {
            var select = e.target;
            var index = select.getSelectedIndex();
            onSelectEquation( index );
        } );
}

goog.exportSymbol( 'DrawTweet.start', DrawTweet.start );
goog.exportSymbol( 'red', red );
goog.exportSymbol( 'green', green );
goog.exportSymbol( 'blue', blue );

//------------------------------------------------------------------------------
var DIM;

function Array2D( x, y ) {
    var array2D = new Array( x );
    for ( var i = 0; i < array2D.length; i++ ) {
        array2D[i] = new Array(y);
    }
    return array2D;
}
function rand( n ) {
    return Math.floor( Math.random() * n );
}

var nameFunctions = [
    'Gradient',
    'Horizontals',
    'Table cloths',
    'Random painter',
    'Mandelbrot'
];
var redFunctions = [
    function ( i, j ) {
        var t = Math.cos( Math.atan2( j - 512, i - 512 ) / 2 );
        return t * t * 255;
    },
    function ( i, j ) {
        if ( typeof window['staticKR'] === 'undefined' ) { window['staticKR'] = 0; }
        window['staticKR'] += 2 * Math.random();
        var l = Math.floor( window['staticKR'] ); l %= 512;
        return l > 255 ? 511 - l : l;
    },
    function ( i, j ) {
        var s = 3 / ( j + 200 );
        var y = ( j + Math.sin(( i * i + ( j - 700 ) * ( j - 700 ) * 5 ) / 100 / DIM ) * 35 ) * s;
        return ( Math.floor(( i + DIM ) * s + y ) % 2 + Math.floor(( DIM * 2 - i ) * s + y ) % 2 ) * 127;
    },
    function ( i, j ) {
        if ( !window['staticRed'] ) { window['staticRed'] = new Array2D( 1024, 1024 ); }
        var c = window['staticRed'];
        return !c[i][j] ? c[i][j] = !rand( 999 ) ? rand( 256 ) : red(( i + rand( 2 ) ) % 1024, ( j + rand( 2 ) ) % 1024 ) : c[i][j];
    },
    function ( i, j ) {
        var a = 0, b = 0, c, d, n = 0;
        while ( ( c = a * a ) + ( d = b * b ) < 4 && n++ < 880 ) {
            b = 2 * a * b + j * 8e-9 - .645411; a = c - d + i * 8e-9 + .356888;
        }
        return 255 * Math.pow(( n - 80 ) / 800, 3. );
    }
];
var greenFunctions = [
    function ( i, j ) {
        var t = Math.cos( Math.atan2( j - 512, i - 512 ) / 2 - 2 * Math.acos( -1 ) / 3 );
        return t * t * 255;
    },
    function ( i, j ) {
        if ( typeof window['staticKG'] === 'undefined' ) { window['staticKG'] = 0; }
        window['staticKG'] += 2 * Math.random();
        var l = Math.floor( window['staticKG'] ); l %= 512;
        return l > 255 ? 511 - l : l;
    },
    function ( i, j ) {
        var s = 3 / ( j + 200 );
        var y = ( j + Math.sin(( i * i + ( j - 700 ) * ( j - 700 ) * 5 ) / 100 / DIM ) * 35 ) * s;
        return ( Math.floor( 5 * ( ( i + DIM ) * s + y ) ) % 2 + Math.floor( 5 * ( ( DIM * 2 - i ) * s + y ) ) % 2 ) * 127;
    },
    function ( i, j ) {
        if ( !window['staticGreen'] ) { window['staticGreen'] = new Array2D( 1024, 1024 ); }
        var c = window['staticGreen'];
        return !c[i][j] ? c[i][j] = !rand( 999 ) ? rand( 256 ) : green(( i + rand( 2 ) ) % 1024, ( j + rand( 2 ) ) % 1024 ) : c[i][j];
    },
    function ( i, j ) {
        var a = 0, b = 0, c, d, n = 0;
        while ( ( c = a * a ) + ( d = b * b ) < 4 && n++ < 880 ) {
            b = 2 * a * b + j * 8e-9 - .645411; a = c - d + i * 8e-9 + .356888;
        }
        return 255 * Math.pow(( n - 80 ) / 800, .7 );
    }
];
var blueFunctions = [
    function ( i, j ) {
        var t = Math.cos( Math.atan2( j - 512, i - 512 ) / 2 + 2 * Math.acos( -1 ) / 3 );
        return t * t * 255;
    },
    function ( i, j ) {
        if ( typeof window['staticKB'] === 'undefined' ) { window['staticKB'] = 0; }
        window['staticKB'] += 2 * Math.random();
        var l = Math.floor( window['staticKB'] ); l %= 512;
        return l > 255 ? 511 - l : l;
    },
    function ( i, j ) {
        var s = 3 / ( j + 200 );
        var y = ( j + Math.sin(( i * i + ( j - 700 ) * ( j - 700 ) * 5 ) / 100 / DIM ) * 35 ) * s;
        return ( Math.floor( 29 * ( ( i + DIM ) * s + y ) ) % 2 + Math.floor( 29 * ( ( DIM * 2 - i ) * s + y ) ) % 2 ) * 127;
    },
    function ( i, j ) {
        if ( !window['staticBlue'] ) { window['staticBlue'] = new Array2D( 1024, 1024 ); }
        var c = window['staticBlue'];
        return !c[i][j] ? c[i][j] = !rand( 999 ) ? rand( 256 ) : blue(( i + rand( 2 ) ) % 1024, ( j + rand( 2 ) ) % 1024 ) : c[i][j];
    },
    function ( i, j ) {
        var a = 0, b = 0, c, d, n = 0;
        while ( ( c = a * a ) + ( d = b * b ) < 4 && n++ < 880 ) {
            b = 2 * a * b + j * 8e-9 - .645411; a = c - d + i * 8e-9 + .356888;
        }
        return 255 * Math.pow(( n - 80 ) / 800, .5 );
    }
];
