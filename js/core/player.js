var Board = require("./board");

module.exports = Player;

function Player({id, name, stats, boardSize, spectrum, brain}, commandBuilder){
	var self = this;

	var stat = commandBuilder.access("stat");
	var damage = commandBuilder.access("damage");
	var heal = commandBuilder.access("heal");

	this.id = id;
	this.dead = false;
	this.nextTurn = brain.nextTurn;

	this.board = new Board(boardSize, spectrum, commandBuilder.access("board"));

	this.get = function(param, max){
		return stats[param][max ? "maxValue" : "value"];
	}
	this.damage = function(amount){
		var rest = self.damageShield(amount);
		rest && self.damageHealth(rest);
	}
	this.damageHealth = function(amount){
		if(!amount){
			return;
		}
		stats.health.value -= amount;
		if(stats.health.value <= 0){
			self.dead = true;
		}
		damage.put("health", amount);
		stat.set("health", stats.health.value);
	}
	this.heal = function(amount){
		amount = Math.min(amount, stats.health.maxValue - stats.health.value);
		if(!amount){
			return;
		}
		stats.health.value += amount;
		heal.put("health", amount);
		stat.set("health", stats.health.value);
	}
	this.increaseMaxHealth = function(amount){
		stats.health.maxValue += amount;
		heal.put("max.health", amount);
		stat.set("max.health", stats.health.maxValue);
	}
	this.decreaseMaxHealth = function(amount){
		stats.health.maxValue -= amount;
		stats.health.value = Math.min(stats.health.value, stats.health.maxValue);
		if(stats.health.value <= 0){
			self.dead = true;
		}
		damage.put("max.health", amount);
		stat.set("health", stats.health.value);
		stat.set("max.health", stats.health.maxValue);
	}
	this.addShield = function(amount){
		stats.shield.value += amount;
		heal.put("shield", amount);
		stat.set("shield", stats.shield.value);
	}
	this.damageShield = function(amount){
		var dmg = Math.min(amount, stats.shield.value);
		stats.shield.value -= dmg;
		dmg && damage.put("shield", dmg);
		dmg && stat.set("shield", stats.shield.value);
		return amount - dmg;
	}
	this.useSpeed = function(){
		if(stats.speed.value > 0){
			stats.speed.value--;
			damage.put("speed", 1);
			stat.set("speed", stats.speed.value);
			return true;
		}else{
			return false;
		}
	}
	this.regenSpeed = function(){
		if(stats.speed.value == stats.speed.maxValue){
			return;
		}
		stats.speed.value++;
		heal.put("speed", 1);
		stat.set("speed", stats.speed.value);
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