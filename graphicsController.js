var Scheduler = require("./scheduler");
var Graphics = require("./graphics");
var Promise = require("bluebird");

module.exports = function(){
	var scheduler = new Scheduler(execute);
	var g = new Graphics();

	this.start = g.start;
	this.obey = scheduler.schedule;
	this.getBoardSnapshot = function(){

	}

	var methods = {
		move({id, x, y}){
			return g.board.tokens[id].moveTo(x, y);
		},
		vanish({id}){
			return g.board.tokens[id].fadeOut()
				.then(() => g.board.tokens[id].destroy());
		},
		appear({x, y, id, type}){
			return g.board.createToken(x, y, {id, type}).fadeIn();
		}
	}

	function execute({data, meta}){
		if(meta.type == "init"){
			rename(data, "create", "appear");
		}
		return Promise.map(Object.keys(data), function(key){
			if(Array.isArray(data[key])){
				return Promise.map(data[key], methods[key]);
			}else{
				return methods[key](data[key]);
			}
		});
	}
}

function rename(obj, key, newKey){
	obj[newKey] = obj[key];
	delete obj[key];
}