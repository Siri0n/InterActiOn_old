var UI = require("./ui/ui");
var GameController = require("./core/gameController");
var Promise = require("bluebird");
var LocalPlayer = require("./core/localPlayer");
var PlayerManager = require("./core/playerManager");


var gameOptions = {
	boardSize: 7,
	players: [
		{
			id: "1",
			name: "First player",
			type: "local"
		},
		{
			id: "2",
			name: "Not so first player",
			type: "local"
		}
	]
}

var ui = new UI(gameOptions);
var gc = new GameController(null, {fire: 3, water: 3, shit: 1});

var p = ui.start(1200, 600);
p.then(function(){
	gc.onCommand.add(ui.obey);
	gc.init(gameOptions);
	var pm = new PlayerManager(
		...Object.keys(ui.players).map(
			key => new LocalPlayer(key, ui.players[key].board.events)
		)
	);
	pm.gameLoop(gc).then(function(result){
		ui.onExecuteEnd.addOnce(()=>alert("There's no shit anymore!\nPlayer " + result.player + " wins!"));
	});
})

