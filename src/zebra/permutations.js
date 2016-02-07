function permutations( array ) {
  var n = array.length;
  if ( n < 2 ) {
   return [array];
  }
  var rt = [];
  for ( var i = 0; i < n; i++ ) {
    // Create a new array from [array] where the
    // [i]-th term has been ignored.
    var t = array.slice( 0 );
    t.splice( i, 1 );

    var tz = permutations( t );
    tz.forEach( function( tp ) {
      tp.unshift( array[i] );
      rt.push( tp );
    });
  }
  return rt;
}
////console.log( permutations( [1, 2, 3, 4] ) );

function perms( array ) {
  var rt = [];
  function f( array, a ) {
    if ( a == array.length ) {
      rt.push( array.slice( 0 ) );
      return;
    }
    for ( var t, k = a; k < array.length; k++ ) {
      t = array[a]; array[a] = array[k]; array[k] = t;
      f( array, a + 1 );
      t = array[a]; array[a] = array[k]; array[k] = t;      
    }
  }
  f(array, 0);
  return rt;
}
console.log( perms( [1, 2, 3, 4] ) );
