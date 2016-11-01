var UI = require("./ui");
var GameController = require("./gameController");
var Promise = require("bluebird");
var LocalPlayer = require("./localPlayer");
var PlayerManager = require("./playerManager");

const size = 7;

var ui = new UI();
var gc = new GameController(size, null, {fire: 3, water: 3, shit: 1});

ui.start(1500, 600).then(function(){
	gc.onCommand.add(ui.obey);
	gc.init("board", "board2");
	var p = new LocalPlayer(ui.board.events);
	var pm = new PlayerManager(
		new LocalPlayer("board", ui.board.events),
		new LocalPlayer("board2", ui.board2.events)
	);
	pm.gameLoop(gc).then(function(){
		ui.onExecuteEnd.addOnce(()=>alert("There's no shit anymore!"));
	});
})

