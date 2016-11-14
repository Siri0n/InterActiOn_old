var UI = require("./ui/ui");
var GameController = require("./core/gameController");
var Promise = require("bluebird");
var brains = require("./core/brains");



var gameOptions = {
	defaults: {
		boardSize: 7,
		spectrum: {fire: 4, water: 3, shit: 1}
	},
	players: [
		{
			id: "1",
			name: "First player",
			type: "local",
			health: 20
		},
		{
			id: "2",
			name: "Not so first player",
			type: "local",
			health: 20
		}
	]
}

var players = gameOptions.players.map(
	player =>  Object.assign({}, gameOptions.defaults, player)
);

var ui = new UI(players);

ui.start(1200, 600).then(function(){
	for(let player of players){
		player.brain = new brains.Local(player.id, ui.players[player.id].board.events); // for now
	}
	var gc = new GameController(players);
	gc.onCommand.add(ui.obey);
	gc.init();
	gc.gameLoop().then(function(result){
		console.log("RESUKLT", result);
		ui.onExecuteEnd.addOnce(()=>alert("Player " + result.player + " wins!"));
	});
})

