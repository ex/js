
var numberFormat = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 5 });
function pf(v) {
    return numberFormat.format(v);
};

var Frets = React.createClass({
    displayName: "Frets",

    getInitialState: function () {
        return {
            x: 0.0,
            y: 0.0,
            length: 0.0,
            width1: 0.0,
            width2: 0.0,
            frets: 0.0,
            edo: 12,
            result: "Press Calculate"
        };
    },
    calculate: function () {
        var A = Number(this.state.width1);
        var B = Number(this.state.width2);
        var x = this.state.x;
        var y = this.state.y;

        y -= (A - B) / 2.0;
        if (A < B) {
            var t = A;A = B;B = t;
        }
        var L = Number(this.state.length);
        var D = L;
        var R = Math.pow(0.5, 1.0 / this.state.edo);

        var T = "COLOR\nGROSORLIN\nZ\n" + pf(x - 5) + "," + pf(y) + "\n" + pf(x + D + 5) + "," + pf(y) + "\n_line\n" + pf(x) + "," + pf(y + (A - B) / 2.0) + "\n" + pf(D + x) + "," + pf(y) + "\n" + pf(D + x) + "," + pf(A + y) + "\n" + pf(x) + "," + pf(y + (A + B) / 2.0) + "\n" + pf(x) + "," + pf(y + (A - B) / 2.0) + "\n";
        T += "\n_copy\n" + pf(D + x) + "," + pf(y) + "\n\nmodo de copia = Múltiple\n" + pf(D + x) + "," + pf(y) + "\n";

        var f = [];
        for (var i = 1; i <= this.state.frets; i++) {
            L = L * R;
            f[i] = D - L;
            T += pf(f[i] + x) + "," + pf(y) + "\n";
        }
        if (A != B) {
            T += "\nComando: _trim\n\nB\n" + pf(f[1] + x - 0.0001) + "," + pf(y + 0.00001) + "\n" + pf(f[this.state.frets] + x + 0.0001) + "," + pf(y + 0.00001) + "\n";
            T += "O\n\n\nComando: _trim\n\nB\n" + pf(f[1] + x - 0.0001) + "," + pf(y + A - 0.00001) + "\n" + pf(f[this.state.frets] + x + 0.0001) + "," + pf(y + A - 0.00001) + "\n";
            T += "O\n\n\nFIN";
        } else {
            T += "\n\n\nFIN";
        }
        return T;
    },
    handleSubmit: function (e) {
        e.preventDefault();
        this.setState({ result: this.calculate() });
    },
    changeFrets: function (e) {
        var val = Math.floor(e.target.value);
        this.setState({ frets: isNaN(val) ? 0 : val });
    },
    changeEdo: function (e) {
        var val = Math.floor(e.target.value);
        this.setState({ edo: isNaN(val) ? 0 : val });
    },
    changeLength: function (e) {
        var val = e.target.value;
        this.setState({ length: isNaN(val) ? 0 : val });
    },
    changeX: function (e) {
        var val = Math.floor(e.target.value);
        this.setState({ x: isNaN(val) ? 0 : val });
    },
    changeY: function (e) {
        var val = Math.floor(e.target.value);
        this.setState({ y: isNaN(val) ? 0 : val });
    },
    changeWidth1: function (e) {
        var val = e.target.value;
        this.setState({ width1: isNaN(val) ? 0 : val });
    },
    changeWidth2: function (e) {
        var val = e.target.value;
        this.setState({ width2: isNaN(val) ? 0 : val });
    },
    render: function () {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "h4",
                null,
                "Frets Calculator"
            ),
            React.createElement(
                "form",
                { onSubmit: this.handleSubmit },
                React.createElement(
                    "table",
                    null,
                    React.createElement(
                        "tbody",
                        null,
                        React.createElement(
                            "tr",
                            null,
                            React.createElement(
                                "td",
                                { width: 80 },
                                "Origin X:"
                            ),
                            React.createElement(
                                "td",
                                null,
                                React.createElement("input", { type: "text", value: this.state.x, onChange: this.changeX })
                            )
                        ),
                        React.createElement(
                            "tr",
                            null,
                            React.createElement(
                                "td",
                                { width: 80 },
                                "Origin Y:"
                            ),
                            React.createElement(
                                "td",
                                null,
                                React.createElement("input", { type: "text", value: this.state.y, onChange: this.changeY })
                            )
                        ),
                        React.createElement(
                            "tr",
                            null,
                            React.createElement(
                                "td",
                                { width: 80 },
                                "Length:"
                            ),
                            React.createElement(
                                "td",
                                null,
                                React.createElement("input", { type: "text", value: this.state.length, onChange: this.changeLength })
                            )
                        ),
                        React.createElement(
                            "tr",
                            null,
                            React.createElement(
                                "td",
                                { width: 80 },
                                "Width A:"
                            ),
                            React.createElement(
                                "td",
                                null,
                                React.createElement("input", { type: "text", value: this.state.width1, onChange: this.changeWidth1 })
                            )
                        ),
                        React.createElement(
                            "tr",
                            null,
                            React.createElement(
                                "td",
                                { width: 80 },
                                "Width B:"
                            ),
                            React.createElement(
                                "td",
                                null,
                                React.createElement("input", { type: "text", value: this.state.width2, onChange: this.changeWidth2 })
                            )
                        ),
                        React.createElement(
                            "tr",
                            null,
                            React.createElement(
                                "td",
                                { width: 80 },
                                "Frets:"
                            ),
                            React.createElement(
                                "td",
                                null,
                                React.createElement("input", { type: "text", value: this.state.frets, onChange: this.changeFrets })
                            )
                        ),
                        React.createElement(
                            "tr",
                            null,
                            React.createElement(
                                "td",
                                { width: 80 },
                                "EDO:"
                            ),
                            React.createElement(
                                "td",
                                null,
                                React.createElement("input", { type: "text", value: this.state.edo, onChange: this.changeEdo })
                            )
                        ),
                        React.createElement(
                            "tr",
                            null,
                            React.createElement(
                                "td",
                                null,
                                React.createElement(
                                    "button",
                                    null,
                                    "Calculate"
                                )
                            )
                        )
                    )
                ),
                React.createElement(
                    "table",
                    null,
                    React.createElement(
                        "tbody",
                        null,
                        React.createElement(
                            "tr",
                            null,
                            React.createElement(
                                "td",
                                null,
                                "Results:"
                            )
                        ),
                        React.createElement(
                            "tr",
                            null,
                            React.createElement(
                                "td",
                                null,
                                React.createElement("textarea", { name: "description", value: this.state.result })
                            )
                        )
                    )
                )
            )
        );
    }
});

ReactDOM.render(React.createElement(
    "div",
    null,
    React.createElement(Frets, null),
    React.createElement("br", null)
), document.getElementById('container'));