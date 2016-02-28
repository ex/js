
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
    'Demo',
    'Gradient',
    'Horizontals',
    'Table cloths',
    'Random painter',
    'Mandelbrot I',
    'Mandelbrot II',
    'Sierpinksy'
];

var mathFunctions = [
    [
        function ( i, j ) {
            var q = ( i && j ) ? ( i % j ) & ( j % i ) : 0;
            return q > 0 ? 256 - q / 4 : 0;
        },
        function ( i, j ) {
            var q = ( i && j ) ? ( i % j ) + ( j % i ) : 0;
            return q > 0 ? 256 - q / 4 : 0;
        },
        function ( i, j ) {
            var q = ( i && j ) ? ( i % j ) | ( j % i ) : 0;
            return q > 0 ? 256 - q / 4 : 0;
        }
    ],
    [
        function ( i, j ) {
            var t = Math.cos( Math.atan2( j - 512, i - 512 ) / 2 );
            return t * t * 255;
        },
        function ( i, j ) {
            var t = Math.cos( Math.atan2( j - 512, i - 512 ) / 2 - 2 * Math.acos( -1 ) / 3 );
            return t * t * 255;
        },
        function ( i, j ) {
            var t = Math.cos( Math.atan2( j - 512, i - 512 ) / 2 + 2 * Math.acos( -1 ) / 3 );
            return t * t * 255;
        }
    ],
    [
        function ( i, j ) {
            if ( window['dataRed'] === null ) { window['dataRed'] = 0; }
            window['dataRed'] += 2 * Math.random();
            var l = Math.floor( window['dataRed'] ); l %= 512;
            return l > 255 ? 511 - l : l;
        },
        function ( i, j ) {
            if ( window['dataGreen'] === null ) { window['dataGreen'] = 0; }
            window['dataGreen'] += 2 * Math.random();
            var l = Math.floor( window['dataGreen'] ); l %= 512;
            return l > 255 ? 511 - l : l;
        },
        function ( i, j ) {
            if ( window['dataBlue'] === null ) { window['dataBlue'] = 0; }
            window['dataBlue'] += 2 * Math.random();
            var l = Math.floor( window['dataBlue'] ); l %= 512;
            return l > 255 ? 511 - l : l;
        }
    ],
    [
        function ( i, j ) {
            var s = 3 / ( j + 200 );
            var y = ( j + Math.sin(( i * i + ( j - 700 ) * ( j - 700 ) * 5 ) / 100 / 1024 ) * 35 ) * s;
            return ( Math.floor(( i + 1024 ) * s + y ) % 2 + Math.floor(( 1024 * 2 - i ) * s + y ) % 2 ) * 127;
        },
        function ( i, j ) {
            var s = 3 / ( j + 200 );
            var y = ( j + Math.sin(( i * i + ( j - 700 ) * ( j - 700 ) * 5 ) / 100 / 1024 ) * 35 ) * s;
            return ( Math.floor( 5 * ( ( i + 1024 ) * s + y ) ) % 2 + Math.floor( 5 * ( ( 1024 * 2 - i ) * s + y ) ) % 2 ) * 127;
        },
        function ( i, j ) {
            var s = 3 / ( j + 200 );
            var y = ( j + Math.sin(( i * i + ( j - 700 ) * ( j - 700 ) * 5 ) / 100 / 1024 ) * 35 ) * s;
            return ( Math.floor( 29 * ( ( i + 1024 ) * s + y ) ) % 2 + Math.floor( 29 * ( ( 1024 * 2 - i ) * s + y ) ) % 2 ) * 127;
        }
    ],
    [
        function ( i, j ) {
            if ( window['dataRed'] === null ) { window['dataRed'] = new Array2D( 512, 512 ); }
            var c = window['dataRed'], x = Math.floor( i / 2 ), y = Math.floor( j / 2 );
            return !c[x][y] ? c[x][y] = !rand( 999 ) ? rand( 256 ) : red(( i + rand( 2 ) ) % 1024, ( j + rand( 2 ) ) % 1024 ) : c[x][y];
        },
        function ( i, j ) {
            if ( window['dataGreen'] === null ) { window['dataGreen'] = new Array2D( 512, 512 ); }
            var c = window['dataGreen'], x = Math.floor( i / 2 ), y = Math.floor( j / 2 );
            return !c[x][y] ? c[x][y] = !rand( 999 ) ? rand( 256 ) : green(( i + rand( 2 ) ) % 1024, ( j + rand( 2 ) ) % 1024 ) : c[x][y];
        },
        function ( i, j ) {
            if ( window['dataBlue'] === null ) { window['dataBlue'] = new Array2D( 512, 512 ); }
            var c = window['dataBlue'], x = Math.floor( i / 2 ), y = Math.floor( j / 2 );
            return !c[x][y] ? c[x][y] = !rand( 999 ) ? rand( 256 ) : blue(( i + rand( 2 ) ) % 1024, ( j + rand( 2 ) ) % 1024 ) : c[x][y];
        }
    ],
    [
        function ( i, j ) {
            var a = 0, b = 0, c, d, n = 0;
            while ( ( c = a * a ) + ( d = b * b ) < 4 && n++ < 2048 ) {
                b = 2 * a * b + j / 5e4 + .06, a = c - d + i / 5e4 + 0.34;
            }
            window['dataRed'] = Math.floor( n / 4 );
            return window['dataRed'];
        },
        function ( i, j ) {
            return 2 * window['dataRed'];
        },
        function ( i, j ) {
            return 4 * window['dataRed'];
        }
    ],
    [
        function ( i, j ) {
            var a = 0, b = 0, c, d, n = 0;
            while ( ( c = a * a ) + ( d = b * b ) < 4 && n++ < 880 ) {
                b = 2 * a * b + j * 8e-9 - 0.645411; a = c - d + i * 8e-9 + 0.356888;
            }
            window['dataRed'] = n;
            return 255 * Math.pow( ( n - 80 ) / 800, 3.0 );
        },
        function ( i, j ) {
            return 255 * Math.pow( ( window['dataRed'] - 80 ) / 800, 0.7 );
        },
        function ( i, j ) {
            return 255 * Math.pow( ( window['dataRed'] - 80 ) / 800, 0.5 );
        }
    ],
    [
        function ( i, j ) {
            return Math.cos( i & j ) << 7;
        },
        function ( i, j ) {
            return red( 1024 - i, 1024 - j );
        },
        function ( i, j ) {
            return Math.tan( i ^ j ) << 4;
        }
    ],
    [
        function ( i, j ) {
            return 255;
        },
        function ( i, j ) {
            return 255;
        },
        function ( i, j ) {
            return 255;
        }
    ]
];
