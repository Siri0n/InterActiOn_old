var Token = require("./token");

module.exports = Board;

function Board(size, spectrum, commandBuilder){
	var board = this;
	var tokens = [];
	var cache = new Cache();

	this.size = size;
	this.meta = commandBuilder.meta;
	this.spectrum = spectrum;

	this.forEachCell = function(f){
		for(var i = 0; i < size; i++){
			for(var j = 0; j < size; j++){
				f(i, j);
			}
		}
	}

	this.getToken = function(x, y){
		var key = x + "," + y;
		var cachedResult = cache.get(key);
		if(cachedResult){
			return cachedResult;
		}
		var result = tokens.find(token => token.x == x && token.y == y);
		if(result){
			return cache.set(key, result);
		}else{
			return null;
		}
	}

	this.moveToken = function(x0, y0, x1, y1){
		var token = board.getToken(x0, y0);
		if(token){
			token.x = x1;
			token.y = y1;
			cache.invalidate();
			commandBuilder.put("move", {id: token.id, x: x1, y: y1});
		}else{
			console.log("token not found at " + x + " " + y);
		}
	}

	this.destroyToken = function(x, y){
		var token = board.getToken(x, y);
		if(token){
			token.destroyed = true;
			remove(tokens, token);
			cache.invalidate();
			commandBuilder.put("vanish", {id: token.id});
		}else{
			console.log("token not found at " + x + " " + y);
		}
	}

	this.createToken = function(x, y, type){
		var token = new Token(x, y, type);
		tokens.push(token);
		commandBuilder.put("create", {id: token.id, x, y, type});
	}

	this.containsShit = function(){
		return tokens.some(token => token.type == "shit");
	}
}

function Cache(){
	var cache = Object.create(null);
	this.get = function(key){
		return cache[key];
	}
	this.set = function(key, val){
		cache[key] = val;
		return val;
	}
	this.invalidate = function(){
		cache = Object.create(null);
	}
}

function remove(arr, elem){
	var i = arr.indexOf(elem);
	~i && arr.splice(i, 1);
}