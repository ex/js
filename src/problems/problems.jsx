
var Problem001 = React.createClass({
    getDefaultProps: function() {
    },
    getInitialState: function() {
        return {
            solutions: 0
        };
    },
    handleSubmit: function( e ) {
        e.preventDefault();
        this.setState({solutions: problem001()});
    },
    render: function() {
        var optionStyle = {
            width: '100px'
        };
        return (
            <div>
                <h4>Problem 1</h4>
                <form onSubmit={this.handleSubmit}>
                    <table>
                        <tr>
                            <td>Solutions {this.state.solutions}</td>
                            <td width={20}/>
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
        <Problem001/><br/>
    </div>
    , document.getElementById( 'container' )
);
