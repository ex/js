
Generator = function ( name, elements ) {
    this.name = name;
    this.elements = elements;
    this.next = null;
    this.generated = [];
    this.permute( this.generated, this.elements, 0 );
    this.size = this.generated.length;
}

Generator.prototype.chain = function ( next ) {
    this.next = next;
    this.size *= next.size;
    return this;
};

Generator.prototype.swap = function ( array, a, b ) {
    var t = array[a]; array[a] = array[b]; array[b] = t;
};

Generator.prototype.permute = function ( permutations, permutation, visited ) {
    if ( visited === permutation.length ) {
        permutations.push( permutation.concat() );
    }
    else {
        for ( var k = visited; k < permutation.length; k++ ) {
            this.swap( permutation, visited, k );
            this.permute( permutations, permutation, visited + 1 );
            this.swap( permutation, visited, k );
        }
    }
};

Generator.prototype.execute = function ( callback, buffer ) {
    for ( var k = 0; k < this.generated.length; k++ ) {
        buffer[this.name] = this.generated[k];
        if ( this.next === null ) {
            callback( buffer );
        }
        else {
            this.next.execute( callback, buffer );
        }
    }
};

//------------------------------------------------------------------------------
var count = 0;
var start = new Date().getTime();

function check( buffer ) {
    var nations = buffer['nations'];
    var jobs = buffer['jobs'];
    var pets = buffer['pets'];
    var drinks = buffer['drinks'];
    var colors = buffer['colors'];

    count++;
    if ( count % 1000000 === 0 ) {
        var time = new Date().getTime() - start;

        var percent = Math.floor( 10000 * count / g1.size );
        var decimals = ( percent % 100 < 10 ) ? '0' + ( percent % 100 ) : ( percent % 100 );
        var secs = Math.floor( ( time / 1000 ) * ( g1.size / count - 1 ) );
        //Debug.writeln( Math.floor( percent / 100 ) + '.' + decimals + '% ' + secs + ' secs' );
        postMessage( {
            'progress': Math.floor( percent / 100 ) + '.' + decimals + '% ',
            'eta': secs + ' secs'
        } );
    }

    if ( nations.indexOf( 'England' ) != colors.indexOf( 'Red' ) ) return;
    if ( nations.indexOf( 'Spain' ) != pets.indexOf( 'Dog' ) ) return;
    if ( nations.indexOf( 'Japan' ) != jobs.indexOf( 'Painter' ) ) return;
    if ( nations.indexOf( 'Italy' ) != drinks.indexOf( 'Tea' ) ) return;
    if ( nations.indexOf( 'Norway' ) != 0 ) return;
    if ( colors.indexOf( 'Green' ) != colors.indexOf( 'White' ) + 1 ) return;
    if ( jobs.indexOf( 'Photographer' ) != pets.indexOf( 'Snail' ) ) return;
    if ( jobs.indexOf( 'Diplomat' ) != colors.indexOf( 'Yellow' ) ) return;
    if ( drinks.indexOf( 'Milk' ) != 2 ) return;
    if ( drinks.indexOf( 'Coffee' ) != colors.indexOf( 'Green' ) ) return;
    if ( ( nations.indexOf( 'Norway' ) != colors.indexOf( 'Blue' ) + 1 )
      && ( nations.indexOf( 'Norway' ) != colors.indexOf( 'Blue' ) - 1 ) ) return;
    if ( jobs.indexOf( 'Violinist' ) != drinks.indexOf( 'Juice' ) ) return;
    if ( ( pets.indexOf( 'Fox' ) != jobs.indexOf( 'Physician' ) + 1 )
      && ( pets.indexOf( 'Fox' ) != jobs.indexOf( 'Physician' ) - 1 ) ) return;
    if ( ( pets.indexOf( 'Horse' ) != jobs.indexOf( 'Diplomat' ) + 1 )
      && ( pets.indexOf( 'Horse' ) != jobs.indexOf( 'Diplomat' ) - 1 ) ) return;

    //Debug.writeln(  );
    postMessage( {
        'solution': nations + '<br/>' + jobs + '<br/>' + pets + '<br/>' + drinks + '<br/>' + colors + '<br/>'
    } );
}

var g1 = new Generator( 'nations', ['England', 'Spain', 'Japan', 'Italy', 'Norway'] );
var g2 = new Generator( 'jobs', ['Painter', 'Photographer', 'Diplomat', 'Violinist', 'Physician'] );
var g3 = new Generator( 'pets', ['Zebra', 'Dog', 'Snail', 'Fox', 'Horse'] );
var g4 = new Generator( 'drinks', ['Milk', 'Coffee', 'Water', 'Juice', 'Tea'] );
var g5 = new Generator( 'colors', ['Red', 'Green', 'Blue', 'White', 'Yellow'] );
//var g1 = new Generator( 'nations', ['Norway', 'Italy', 'England', 'Spain', 'Japan'] );
//var g2 = new Generator( 'jobs', ['Diplomat', 'Physician', 'Photographer', 'Violinist', 'Painter'] );
//var g3 = new Generator( 'pets', ['Fox', 'Horse', 'Snail', 'Dog', 'Zebra'] );
//var g4 = new Generator( 'drinks', ['Water', 'Tea', 'Milk', 'Juice', 'Coffee'] );
//var g5 = new Generator( 'colors', ['Yellow', 'Blue', 'Red', 'White', 'Green'] );

g1.chain( g2.chain( g3.chain( g4.chain( g5 ) ) ) );
g1.execute( check, {} );
