var Promise = require("bluebird");

module.exports = function(players){
	var i = 0;
	this.turn = function(state){
		return players[i].nextTurn(state);
	}
	this.next = function(){
		i = ++i % players.length;
	}
	this.current = function(){
		return players[i];
	}
	this.target = function(){
		return players[(i + 1) % players.length];
	}

}