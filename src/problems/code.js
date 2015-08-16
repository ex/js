
function problem001() {

    var solutions = [];

    /**
     * v: value from the string [s] up to this point
     * r: right number value from string [s]
     * s: string up to this point
     * a: next number to choose
     * max: maximum number to choose
     * goal: target value
     */
    var f = function( v, r, s, a, max, goal ) {
        if ( a > max ) {
            if ( v === goal ) {
                console.log( s + ': ' + v );
                solutions.push( s );
            }
            return;
        }
        // Concat
        var inc = ( r >= 0 )? 10 * r + a : 10 * r - a;
        f( v + inc - r, inc, s + a, a + 1, max, goal );

        // Adding
        if ( s !== '' ) {
            f( v + a, a, s + '+' + a, a + 1, max, goal );
        }

        // Sustracting
        if ( s !== '' ) {
            f( v - a, -a, s + '-' + a, a + 1, max, goal );
        }
    };

    f( 0, 0, '', 1, 9, 100 );

    return solutions.length;
}
