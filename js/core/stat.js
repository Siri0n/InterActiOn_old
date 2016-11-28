module.exports = function(value, maxValue, commandBuilder){
	var stat = commandBuilder;
	var max = (typeof maxValue != "undefined") && stat.access("max");
	this.value = function(){
		return value;
	}
	this.maxValue = function(){
		return maxValue;
	}
	this.add = function(amount){
		var rest = 0;
		if(amount > 0){
			if(max){
				rest = amount;
				amount = Math.min(amount, maxValue - value);
				rest -= amount;
			}
			stat.put("heal", amount);
			value += amount;
			stat.set("value", value);
		}else if(amount < 0){
			rest = amount;
			amount = Math.min(-amount, value);
			rest += amount;
			stat.put("damage", amount);
			value -= amount;
			stat.set("value", value);
		}
		return rest;
	}
	this.addMax = function(amount){
		if(!max){
			throw new Error("This stat has no max value");
		}
		if(amount > 0){
			max.put("heal", amount);
			maxValue += amount;
			max.set("value", maxValue);
		}else if(amount < 0){
			amount = Math.min(-amount, maxValue);
			stat.put("damage", amount);
			maxValue -= amount;
			max.set("value", maxValue);
			if(value > maxValue){
				value = maxValue;
				stat.set("value", value);
			}
		}
	}
}