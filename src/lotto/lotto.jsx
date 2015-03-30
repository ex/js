
var LottoEntry = React.createClass( {
    getDefaultProps: function() {
        return {
            day: null,
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
        var dateStyle = {
            color: '#5522FF'
        };
        var lotto = '';
        for ( var k = 0; k < this.props.lotto.length; k++ ) {
            lotto += this.formatNumber( this.props.lotto[k], ' ' );
        }
        var day = '';
        if ( this.props.day && this.props.day.length === 3 ) {
            var day = this.formatNumber( this.props.day[0] ) + '/' 
                            + this.formatNumber( this.props.day[1] ) 
                            + '/' + this.props.day[2] + ': ';
        }

        return (
            <div><span style={dateStyle}>{day}</span>{lotto}</div>
        );
}
} );

var LottoPlayer = React.createClass( {
    getDefaultProps: function() {
        return {
            type: 'Descent',
            timer: 1000
        };
    },
    getInitialState: function() {
        return { secondsElapsed: 0 };
    },
    tick: function() {
        this.setState( { secondsElapsed: this.state.secondsElapsed + 1 } );
    },
    componentDidMount: function() {
        this.interval = setInterval( this.tick, this.props.timer );
    },
    componentWillUnmount: function() {
        clearInterval( this.interval );
    },
    render: function() {
        var date;
        if ( this.props.type === 'Ascendant') {
            date = g_lottoData[g_lottoData.length - 1 - ( this.state.secondsElapsed % g_lottoData.length )];
        }
        else if ( this.props.type === 'Random') {
            date = g_lottoData[Math.floor( Math.random() * g_lottoData.length )];
        }
        else {
            date = g_lottoData[this.state.secondsElapsed % g_lottoData.length];
        }
        return (
            <div>
                <h4> LottoPlayer {this.props.type}</h4>
                <div>
                    <LottoEntry day={date[0]} lotto={date[1]}/>
                </div>
            </div>
        );
    }
} );

var LottoRandom = React.createClass({
    getDefaultProps: function() {
        return { max: 40 };
    },
    getInitialState: function() {
        return { play: this.calculate() };
    },
    calculate: function() {
        var play = [];
        for ( var k = 0; k < 6; k++ ) {
            play.push( 1 + Math.floor( this.props.max * Math.random() ) );
        }
        return play;
    },
    handleSubmit: function( e ) {
        e.preventDefault();
        this.setState({play: this.calculate()});
    },
    render: function() {
        return (
            <div>
                <h4>Random Lotto</h4>
                <form onSubmit={this.handleSubmit}>
                    <table>
                        <tr>
                            <td><LottoEntry lotto={this.state.play}/></td>
                            <td width={10}/>
                            <td><button>Calculate</button></td>
                        </tr>
                    </table>
                </form>
            </div>
    );
    }
});

React.render(
    <div>
        <LottoRandom/><br/>
        <LottoPlayer/><br/>
        <LottoPlayer type={'Ascendant'}/><br/>
        <LottoPlayer timer={500} type={'Random'}/>
    </div>
    , document.getElementById( 'container' )
);
