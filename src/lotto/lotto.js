
var LottoPlayer = React.createClass( {
    displayName: 'LottoPlayer',
    getInitialState: function() {
        return {
            secondsElapsed: 0
        };
    },
    tick: function() {
        this.setState( { secondsElapsed: this.state.secondsElapsed + 1 } );
    },
    componentDidMount: function() {
        this.interval = setInterval( this.tick, 500 );
    },
    componentWillUnmount: function() {
        clearInterval( this.interval );
    },
    formatNumber: function( n, separator ) {
        if ( typeof separator === 'undefined' ) {
            return ( n < 10 ) ? '0' + n : n;
        }
        return ( n < 10 ) ? '0' + n + separator: n + separator;
    },
    render: function() {
        var date = g_lottoData[ this.state.secondsElapsed % g_lottoData.length];
        var lotto = '';
        for ( var k = 0; k < date[1].length; k++ ) {
            lotto += this.formatNumber( date[1][k], ' ' );
        }
        var day = this.formatNumber( date[0][0] ) + '/' + this.formatNumber( date[0][1] ) + '/' + date[0][2];
        return (
          React.createElement( "div", null, day, ': ', lotto )
        );
    }
} );

React.render( React.createElement( LottoPlayer, null ), document.getElementById( 'container' ) );
