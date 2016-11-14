var Board = require("./board");

module.exports = Player;

function Player({id, name, health, boardSize, spectrum, brain}, commandBuilder){
	var self = this;

	this.id = id;
	this.health = health;
	this.nextTurn = brain.nextTurn;

	this.board = new Board(boardSize, spectrum, commandBuilder.access("board"));

	this.damage = function(amount){
		self.health -= amount;
		commandBuilder.put("damage", amount);
		commandBuilder.set("health", self.health);
	}
	this.heal = function(amount){
		self.health += amount;
		commandBuilder.put("heal", amount);
		commandBuilder.set("health", self.health);
	}
	this.getRandomType = function(customSpectrum = spectrum){
		var rnd = Math.random;
		var freq = Object.keys(customSpectrum).map(key => ({type: key, value: customSpectrum[key]}));
		var totalFreq = freq.reduce(((a, f) => a + f.value), 0);

		var r = rnd();
		var n = 0;
		for(let f of freq){
			n += f.value/totalFreq;
			if(n >= r){
				return f.type;
			}
		}
	}
}