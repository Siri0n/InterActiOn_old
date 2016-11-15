var UI = require("./ui/ui");
var GameController = require("./core/gameController");
var Promise = require("bluebird");
var brains = require("./core/brains");



var gameOptions = {
	defaults: {
		boardSize: 7,
		spectrum: {fire: 4, water: 4, earth: 4, air: 4},
		type: "local",
		health: 20,
		shield: 0
	},
	players: [
		{
			id: "1",
			name: "First player"
		},
		{
			id: "2",
			name: "Second player"
		}
	]
}

function clone(o){
	return JSON.parse(JSON.stringify(o));
}
var players = gameOptions.players.map(
	player =>  Object.assign(clone(gameOptions.defaults), player)
);

var ui = new UI(players);

ui.start(800, 600).then(function(){
	for(let player of players){
		player.brain = new brains.Local(player.id, ui.players[player.id].board.events); // for now
	}
	var gc = new GameController(players);
	gc.onCommand.add(ui.obey);
	gc.init();
	gc.gameLoop().then(function(result){
		console.log("RESUKLT", result);
	});
})

