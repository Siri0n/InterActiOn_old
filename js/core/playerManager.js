var Promise = require("bluebird");

module.exports = function(...players){
	var i = 0;
	this.turn = function(){
		return players[i].nextTurn();
	}
	this.next = function(){
		i = ++i % players.length;
	}
	this.current = function(){
		return players[i].id;
	}

}