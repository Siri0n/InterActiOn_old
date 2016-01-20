var React = require("react");
var _ = require("lodash");

const C = 50;
var View = React.createClass({
	render(){
		var {state, events} = this.props;
		console.log(state.state);
		if(state.state == "menu"){
			return <MainMenu events={events.menu}/>
		}else if(state.state == "play"){
			return <Game state={state.currentLevel} events={events.game}/>
		}else if(state.state == "settings"){
			return <Settings {...this.props}/>
		}
	}
});

var MainMenu = React.createClass({
	render(){
		var {state, events} = this.props;
		return <div id="menu">
			<MenuItem onClick={events.play}>Play</MenuItem>
			<MenuItem onClick={events.settings}>Settings</MenuItem>
		</div>
	}
});

var MenuItem = React.createClass({
	render(){
		return <div className="menu-item" {...this.props}>
			{this.props.children}
		</div>
	}
});

var Game = React.createClass({
	render(){
		var {state, events} = this.props;
		return <div id="game">
			<div id="field">
				<table>{				
				_.times(state.height, function(i){
					return <tr>{
					_.times(state.width, function(j){
						return <td><div>
							{
								(state.exit[0] == j && state.exit[1] == i) ? "Ω" : ""
							}
						</div></td>
					})
					}</tr>
				})
				}</table>
				{state.objects.map(function(obj, index){
					return <GameObject x={obj.position[0]} y={obj.position[1]} 
						value={obj.value} className={obj.type} onClick={() => events.click(index)}/>
				})}
			</div>
		</div>
	}
})

var GameObject = React.createClass({
	render(){
		var props = this.props;
		console.log(props.value);
		return <div className={"object " + props.className} onClick={props.onClick}
			style={{transform: `translate(${props.x*C}px,${props.y*C}px)`}}>
			{props.value}
		</div>
	}
})
var Settings = React.createClass({
	render(){
		return <div>Nothing here yet</div>
	}
})


module.exports = View;