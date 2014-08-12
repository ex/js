
goog.provide( 'DrawTweet.start' );

var ctx;
var canvasWidth;
var canvasHeight;
var DIM;

function red( i, j ) {
    var s = 3 / ( j + 200 );
    var y = ( j + Math.sin(( i * i + _sq( j - 700 ) * 5 ) / 100 / DIM ) * 35 ) * s;
    return ( Math.floor( ( i + DIM ) * s + y ) % 2 + Math.floor( ( DIM * 2 - i ) * s + y ) % 2 ) * 127;
}
function green( i, j ) {
    var s = 3 / ( j + 200 );
    var y = ( j + Math.sin(( i * i + _sq( j - 700 ) * 5 ) / 100 / DIM ) * 35 ) * s;
    return ( Math.floor( 5 * ( ( i + DIM ) * s + y ) ) % 2 + Math.floor( 5 * ( ( DIM * 2 - i ) * s + y ) ) % 2 ) * 127;
}
function blue( i, j ) {
    var s = 3 / ( j + 200 );
    var y = ( j + Math.sin(( i * i + _sq( j - 700 ) * 5 ) / 100 / DIM ) * 35 ) * s;
    return ( Math.floor( 29 * ( ( i + DIM ) * s + y ) ) % 2 + Math.floor( 29 * ( ( DIM * 2 - i ) * s + y ) ) % 2 ) * 127;
}
function hexColor( c ) {
    return ( c > 16 ) ? c.toString( 16 ) : ( c > 0 ) ? '0' + c.toString( 16 ) : '00';
}
// Square
function _sq( x ) {
    return x * x;
}
// Absolute value of cube
function _cb( x ) {
    return abs( x * x * x );
}
// Cube root
function _cr( x ) {
    return Math.floor( pow( x, 1.0 / 3.0 ) );
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

DrawTweet.start = function () {
    var canvas = document.getElementById( "canvas" );
    if ( canvas ) {
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        DIM = 2 * Math.min( canvasWidth, canvasHeight );
        if ( canvas.getContext ) {
            ctx = canvas.getContext( "2d" );
            redraw();
        }
    }
}

DrawTweet.onRedraw = function ( value ) {
    redraw();
}

goog.exportSymbol( 'DrawTweet.start', DrawTweet.start );
goog.exportSymbol( 'DrawTweet.onRedraw', DrawTweet.onRedraw );
