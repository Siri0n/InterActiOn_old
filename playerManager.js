var Promise = require("bluebird");

module.exports = function(...players){
	var i = 0;
	var gameLoop = this.gameLoop = function(controller){
		return players[i].nextTurn().then(function(turn){
			return controller.handleTurn(turn);
		}).then(function(result){
			if(result == "repeat"){
				return gameLoop(controller);
			}else if(result == "end"){
				return players[i];
			}else{
				i = ++i % players.length;
				return gameLoop(controller);
			}
		});
	}

}