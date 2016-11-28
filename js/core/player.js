var Board = require("./board");
var Stat = require("./stat");

module.exports = Player;

function Player({id, name, stats:initialStats, boardSize, spectrum, brain}, commandBuilder){
	var self = this;

	var stats = this.stats = {};

	Object.keys(initialStats).forEach(function(key){
		stats[key] = new Stat(initialStats[key].value, initialStats[key].maxValue, commandBuilder.access("stats." + key));
	})


	this.id = id;
	this.dead = false;
	this.nextTurn = brain.nextTurn;

	this.board = new Board(boardSize, spectrum, commandBuilder.access("board"));

	this.damage = function(amount){
		var rest = self.damageShield(amount);
		rest && self.damageHealth(rest);
	}
	this.damageHealth = function(amount){
		stats.health.add(-amount);
		if(stats.health.value() <= 0){
			self.dead = true;
		}
	}
	this.heal = function(amount){
		stats.health.add(amount);
	}
	this.increaseMaxHealth = function(amount){
		stats.health.addMax(amount);
	}
	this.decreaseMaxHealth = function(amount){
		stats.health.addMax(-amount);
	}
	this.addShield = function(amount){
		stats.shield.add(amount);
	}
	this.damageShield = function(amount){
		return -stats.shield.add(-amount);
	}
	this.useSpeed = function(){
		return !stats.speed.add(-1);
	}
	this.regenSpeed = function(){
		stats.speed.add(1);
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