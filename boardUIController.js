var Promise = require("bluebird");
var Signal = require("./signal");

module.exports = function(board){
	var self = this;

	board.onTokenClick.add(function(event){
		self.events.dispatch(event);
	});

	this.events = new Signal();

	var methods = {
		move({id, x, y}){
			return board.tokens[id].moveTo(x, y);
		},
		vanish({id}){
			return board.tokens[id].fadeOut()
				.then(() => board.tokens[id].destroy());
		},
		appear({x, y, id, type}){
			return board.createToken(x, y, {id, type}).fadeIn();
		},
		fall({x, y, y0, id, type}){
			return board.createToken(x, y0, {id, type}).moveTo(x, y);
		}
	}

	this.executeCommand = function({data, meta} = {null, null}){
		if(!(data || meta)){
			return;
		}
		if(meta.type == "init"){
			rename(data, "create", "appear");
		}
		if(meta.type == "fall"){
			rename(data, "create", "fall");
			data.fall.sort((a, b) => b.x - a.x || b.y - a.y);
			let j;
			let lastX = -1; 
			for(let i = 0; i < data.fall.length; i++){
				if(data.fall[i].x != lastX){
					lastX = data.fall[i].x;
					j = -1;
				}
				data.fall[i].y0 = j--;
			}
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
	if(!(key in obj)){
		return
	}
	obj[newKey] = obj[key];
	delete obj[key];
}