
var LottoEntry = React.createClass( {
    displayName: 'LottoEntry',
    getDefaultProps: function() {
        return {
            day: [0, 0, 0],
            lotto: [0, 0, 0, 0, 0, 0]
        };
    },
    formatNumber: function( n, separator ) {
        if ( typeof separator === 'undefined' ) {
            return ( n < 10 ) ? '0' + n : n;
        }
        return ( n < 10 ) ? '0' + n + separator: n + separator;
    },
    render: function() {
        var lotto = '';
        for ( var k = 0; k < this.props.lotto.length; k++ ) {
            lotto += this.formatNumber( this.props.lotto[k], ' ' );
        }
        var day = this.formatNumber( this.props.day[0] ) + '/' 
                        + this.formatNumber( this.props.day[1] ) + '/' + this.props.day[2];
        return (
            <div>{day} : {lotto}</div>
        );
}
} );

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
    render: function() {
        var date = g_lottoData[ this.state.secondsElapsed % g_lottoData.length];
        return (
            <div>
                <h4> LottoPlayer </h4>
                <div>
                    <LottoEntry day={date[0]} lotto={date[1]}/>
                </div>
            </div>
        );
    }
} );

React.render( <LottoPlayer/>, document.getElementById( 'container' ) );
