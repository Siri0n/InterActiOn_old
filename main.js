var Graphics = require("./graphics");
var BoardController = require("./boardController");
var Promise = require("bluebird");
var LocalPlayer = require("./localPlayer");
var PlayerManager = require("./playerManager");

const size = 7;

var g = new Graphics();
var b = new BoardController(size, null, {fire: 3, water: 3, shit: 1});

g.start(900, 600).then(function(){
	b.onCommand.add(g.board.obey);
	b.init();
	var p = new LocalPlayer(g.board.events);
	var pm = new PlayerManager(p);
	pm.gameLoop(b).then(function(){
		g.board.onExecuteEnd.addOnce(()=>alert("There's no shit anymore!"));
	});
})

