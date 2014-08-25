
var seed = 1;
function generate() {
    return seed = ( seed * 16807 ) % 2147483647;
}
function random() {
    return generate() / 2147483647;
}
function Array2D( x, y ) {
    var array2D = [];
    for ( var i = 0; i < x; i++ ) {
        array2D[i] = [];
    }
    return array2D;
}
function rand( n ) {
    return Math.floor( Math.random() * n );
}
// Add entries here:
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
        var y = ( j + Math.sin(( i * i + ( j - 700 ) * ( j - 700 ) * 5 ) / 100 / 1024 ) * 35 ) * s;
        return ( Math.floor(( i + 1024 ) * s + y ) % 2 + Math.floor(( 1024 * 2 - i ) * s + y ) % 2 ) * 127;
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
        var y = ( j + Math.sin(( i * i + ( j - 700 ) * ( j - 700 ) * 5 ) / 100 / 1024 ) * 35 ) * s;
        return ( Math.floor( 5 * ( ( i + 1024 ) * s + y ) ) % 2 + Math.floor( 5 * ( ( 1024 * 2 - i ) * s + y ) ) % 2 ) * 127;
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
        var y = ( j + Math.sin(( i * i + ( j - 700 ) * ( j - 700 ) * 5 ) / 100 / 1024 ) * 35 ) * s;
        return ( Math.floor( 29 * ( ( i + 1024 ) * s + y ) ) % 2 + Math.floor( 29 * ( ( 1024 * 2 - i ) * s + y ) ) % 2 ) * 127;
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
