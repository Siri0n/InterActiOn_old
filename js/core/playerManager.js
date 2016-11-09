var Promise = require("bluebird");

module.exports = function(...players){
	console.log("players", players);
	var i = 0;
	var gameLoop = this.gameLoop = function(controller){
		return players[i].nextTurn().then(function(turn){
			return controller.handleTurn(turn);
		}).then(function(result){
			if(result.type == "repeat"){
				return gameLoop(controller);
			}else if(result.type == "end"){
				return result;
			}else{
				i = ++i % players.length;
				return gameLoop(controller);
			}
		});
	}

}