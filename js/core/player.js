var Board = require("./board");

module.exports = Player;

function Player({id, name, health, shield, boardSize, spectrum, brain}, commandBuilder){
	var self = this;

	this.id = id;
	this.health = health;
	this.shield = shield;
	this.nextTurn = brain.nextTurn;

	this.board = new Board(boardSize, spectrum, commandBuilder.access("board"));

	this.damage = function(amount){
		var rest = self.damageShield(amount);
		rest && self.damageHealth(rest);
	}
	this.damageHealth = function(amount){
		self.health -= amount;
		commandBuilder.put("damage", amount);
		commandBuilder.set("health", self.health);
	}
	this.heal = function(amount){
		self.health += amount;
		commandBuilder.put("heal", amount);
		commandBuilder.set("health", self.health);
	}
	this.addShield = function(amount){
		self.shield += amount;
		commandBuilder.put("addShield", amount);
		commandBuilder.set("shield", self.shield);
	}
	this.damageShield = function(amount){
		var damage = Math.min(amount, self.shield);
		console.log(`shield: ${self.shield}, damage: ${amount}, shieldDamege: ${damage}`);
		self.shield -= damage;
		console.log(`now shield: ${self.shield}`);
		commandBuilder.put("damageShield", damage);
		commandBuilder.set("shield", self.shield);
		return amount - damage;
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