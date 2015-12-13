
var Frets = React.createClass({
    getInitialState: function() {
        return {
            frets: 18,
            scale: 100,
            edo: 12,
            result: "18 TRASTES DEL SISTEMA 12 EDO CON 100.00 DE ESCALA\n\ntraste 00 = 00.000000000000000\ntraste 01 = 05.612568731830649\ntraste 02 = 10.910128185966059\ntraste 03 = 15.910358474628538\ntraste 04 = 20.629947401590016\ntraste 05 = 25.084646156165917\ntraste 06 = 29.289321881345231\ntraste 07 = 33.258007291498259\ntraste 08 = 37.003947505256320\ntraste 09 = 40.539644249863926\ntraste 10 = 43.876897584531328\ntraste 11 = 47.026845282035211\ntraste 12 = 49.999999999999972\ntraste 13 = 52.806284365915296\ntraste 14 = 55.455064092983008\ntraste 15 = 57.955179237314248\ntraste 16 = 60.314973700794987\ntraste 17 = 62.542323078082937\ntraste 18 = 64.644660940672594"
        };
    },
    calculate: function() {
        var R = Math.pow( 0.5, 1.0 / this.state.edo );
        var T = this.state.frets + " TRASTES DEL SISTEMA " + this.state.edo + " EDO CON " + this.state.scale + " DE ESCALA\n\n";
        T += "traste 00 = 00.000000000000000\n";
        var L = this.state.scale;
        for ( var i = 1; i <= this.state.frets; i++ ) {
            L = L * R;
            var x = this.state.scale - L;
            T += ( ( i < 10 ) ? "traste 0" : "traste " ) + i + " = " + x + "\n";
        }
        this.setState( { result: T } );
    },
    handleSubmit: function( e ) {
        e.preventDefault();
        this.setState( { play: this.calculate() } );
    },
    changeFrets: function( e ) {
        var val = Math.floor( e.target.value );
        this.setState( { frets: isNaN( val ) ? 0 : val } );
    },
    changeEdo : function( e ) {
        var val = Math.floor( e.target.value );
        this.setState( { edo: isNaN( val ) ? 0 : val } );
    },
    changeScale: function( e ) {
        var val = e.target.value;
        this.setState( { scale: isNaN( val ) ? 0 : val } );
    },
    render: function() {
        var optionStyle = {
            width: '100px'
        };
        return (
            <div>
                <h4>Frets Calculator</h4>
                <form onSubmit={this.handleSubmit}>
                    <table>
                        <tbody>
                            <tr>
                                <td width={80}>Frets:</td>
                                <td>
                                    <input type="text" value={this.state.frets} onChange={this.changeFrets} />
                                </td>
                            </tr>
                            <tr>
                                <td width={80}>Scale:</td>
                                <td>
                                    <input type="text" value={this.state.scale} onChange={this.changeScale} />
                                </td>
                            </tr>
                            <tr>
                                <td width={80}>EDO:</td>
                                <td>
                                    <input type="text" value={this.state.edo} onChange={this.changeEdo} />
                                </td>
                            </tr>
                            <tr>
                                <td><button>Calculate</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <table>
                        <tbody>
                            <tr>
                                <td>Results:</td>
                            </tr>
                            <tr>
                                <td>
                                    <textarea name="description" value={this.state.result} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </div>
    );
    }
});

ReactDOM.render(
    <div>
        <Frets/><br/>
    </div>
    , document.getElementById( 'container' )
);

