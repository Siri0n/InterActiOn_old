var Board = require("./board");

module.exports = Player;

function Player({id, name, health, shield, speed, boardSize, spectrum, brain}, commandBuilder){
	var self = this;

	var stat = commandBuilder.access("stat");
	var damage = commandBuilder.access("damage");
	var heal = commandBuilder.access("heal");

	this.id = id;
	this.health = health;
	this.shield = shield;
	this.speed = speed;
	this.nextTurn = brain.nextTurn;

	this.board = new Board(boardSize, spectrum, commandBuilder.access("board"));

	this.damage = function(amount){
		var rest = self.damageShield(amount);
		rest && self.damageHealth(rest);
	}
	this.damageHealth = function(amount){
		self.health -= amount;
		damage.put("health", amount);
		stat.set("health", self.health);
	}
	this.heal = function(amount){
		self.health += amount;
		heal.put("health", amount);
		stat.set("health", self.health);
	}
	this.addShield = function(amount){
		self.shield += amount;
		heal.put("shield", amount);
		stat.set("shield", self.shield);
	}
	this.damageShield = function(amount){
		var dmg = Math.min(amount, self.shield);
		self.shield -= dmg;
		damage.put("shield", dmg);
		stat.set("shield", self.shield);
		return amount - dmg;
	}
	this.useSpeed = function(){
		if(self.speed > 0){
			self.speed--;
			damage.put("speed", 1);
			stat.set("speed", self.speed);
			return true;
		}else{
			return false;
		}
	}
	this.regenSpeed = function(){
		self.speed++;
		heal.put("speed", 1);
		stat.set("speed", self.speed);
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