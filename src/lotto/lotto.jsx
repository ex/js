﻿
class LottoEntry extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            day: null,
            lotto: [0, 0, 0, 0, 0, 0]
        };
    }
    formatNumber( n, separator ) {
        if ( typeof separator === 'undefined' ) {
            return ( n < 10 ) ? '0' + n : n;
        }
        return ( n < 10 ) ? '0' + n + separator: n + separator;
    }
    render() {
        var dateStyle = {
            color: '#6677FF'
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
}

class LottoPlayer extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            type: props.type || 'Descent',
            timer: props.timer || 1000, 
            secondsElapsed: 0
        };
    }
    tick() {
        this.setState( state => ( { secondsElapsed: state.secondsElapsed + 1 } ) );
    }
    componentDidMount() {
        this.interval = setInterval( () => this.tick(), this.state.timer );
    }
    componentWillUnmount() {
        clearInterval( this.interval );
    }
    render() {
        var date;
        if ( this.state.type === 'Ascendant') {
            date = g_lotto.data[g_lotto.counter - 1 - ( this.state.secondsElapsed % g_lotto.counter )];
        }
        else if ( this.state.type === 'Random') {
            date = g_lotto.data[Math.floor( Math.random() * g_lotto.counter )];
        }
        else {
            date = g_lotto.data[this.state.secondsElapsed % g_lotto.counter];
        }
        return (
            <div>
                <h4> LottoPlayer {this.state.type}</h4>
                <div>
                    <LottoEntry day={date[0]} lotto={date[1]}/>
                </div>
            </div>
        );
    }
}

class LottoRandom extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            max: 45,
            play: this.calculate( 45 )
        };
        // This binding is necessary to make `this` work in the callback
        this.handleSubmit = this.handleSubmit.bind( this );
        this.onMaxChange = this.onMaxChange.bind( this );
    }
    calculate( init ) {
        var max = init ? init : this.state.max;
        var play = [];
        if ( max != 45 ) {
            for ( var k = 0; k < 6; k++ ) {
                play.push( 1 + Math.floor( max * Math.random() ) );
            }
        }
        else {
            var found = false;
            while ( !found ) {
                play = [];
                // Use data
                while ( play.length < 6 ) {
                    var num = g_lotto.draft[Math.floor( Math.random() * g_lotto.draft.length )];
                    if ( play.indexOf( num ) === -1 ) {
                        play.push( num );
                    }
                }
                // Sort play
                play.sort( ( a, b ) => {
                    return a - b;
                } );
                // Check that it's not repeated
                var s = play.reduce( ( x, y ) => {
                    return "" + ( x < 10 ? "0" + x : x ) + ( y < 10 ? "0" + y : y );
                } );
                if ( g_lotto.plays[s] ) {
                    alert( "Repeated: " + s );
                }
                else {
                    found = true;
                }
            }
        }
        return play;
    }
    handleSubmit( e ) {
        e.preventDefault();
        this.setState( { play: this.calculate() } );
    }
    onMaxChange( e ) {
        e.preventDefault();
        this.setState( { max: e.target.value } );
        this.setState( { play: this.calculate() } );
    }
    render() {
        var optionStyle = {
            width: '100px'
        };
        return (
            <div>
                <h4>Random Lotto</h4>
                <form onSubmit={this.handleSubmit}>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <select name="optMaxLotto" size="1" style={optionStyle} onChange={this.onMaxChange}>
                                        <option value="45">45</option>
                                        <option value="40">40</option>
                                        <option value="50">50</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td><LottoEntry lotto={this.state.play} /></td>
                                <td width={10} />
                                <td><button>Calculate</button></td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </div>
        );
    }
}

ReactDOM.render(
    <div>
        <LottoRandom /><br />
        <LottoPlayer /> <br />
        <LottoPlayer type={'Ascendant'} /> <br />
        <LottoPlayer timer={500} type={'Random'} />
    </div>
    , document.getElementById( 'container' )
);
