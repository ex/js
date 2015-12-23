
var Frets = React.createClass({
    getInitialState: function() {
        return {
            frets: 18,
            scale: 100,
            edo: 12,
            result: "Press calcualte"
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
        var val = Number( e.target.value );
        this.setState( { scale: isNaN( val ) ? 0 : val } );
    },
    render: function() {
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

