var core = require("./core");
var React = require("react");
var ReactDOM = require("react-dom");
var View = require("./view.jsx");

window.onload = function(){
	core.model.onValue(function(state){
		ReactDOM.render(
			React.createElement(View, {state, events: core.events}),
			document.getElementById("app")
		);
	})
}