var Signal = require("./signal");
var seedrandom = require("seedrandom");

function BoardController(size, spells, frequencies){
	var self = this;
	var board = new Board(size);
	var rnd = seedrandom("dev");
	var freq = Object.keys(frequencies).map(key => ({type: key, value: frequencies[key]}));
	this.onCommand = new Signal();
	this.init = function(){
		board.commandBuilder.start({type: "init"});
		let totalFreq = freq.reduce(((a, f) => a + f.value), 0);
		for(let i = 0; i < size; i++){
			for(let j = 0; j < size; j++){
				let type;
				let r = rnd();
				let n = 0;
				for(let f of freq){
					n += f.value/totalFreq;
					if(n >= r){
						type = f.type;
						break;
					}
				}
				board.createToken(i, j, type);
			}
		}
		var command = board.commandBuilder.finish();
		self.onCommand.dispatch(command);
	}
}

module.exports = BoardController;

function Board(size){
	var board = this;
	var tokens = [];
	var cache = new Cache();
	var commandBuilder = this.commandBuilder = new CommandBuilder();


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

	this.destroyToken = function(x, y){
		var token = board.getTokenAt(x, y);
		if(token){
			remove(tokens, token);
			cache.invalidate();
		}
	}

	this.createToken = function(x, y, type){
		var token = new Token(x, y, type);
		tokens.push(token);
		commandBuilder.add("create", {id: token.id, x, y, type});
	}
}

function Token(x, y, type){
	this.x = x;
	this.y = y;
	this.type = type;
	this.id = generateNewId();
}

function Cache(){
	var cache = Object.create(null);
	this.get = function(key){
		return cache[key];
	}
	this.set = function(key, val){
		cache[key] = value;
	}
	this.invalidate = function(){
		cache = Object.create(null);
	}
}

function remove(arr, elem){
	var i = arr.indexOf(elem);
	~i && arr.splice(i, 1);
}

var lastId = 1;
function generateNewId(){
	return lastId++;
}

function CommandBuilder(){
	var command = {};
	this.start = function(meta){
		if(command.meta){
			throw new Error("Previous command wasn't finished, cannot start new command.");
		}else{
			command.meta = meta;
			command.data = {};
		}
	}
	this.set = function(key, elem){
		if(!command.meta){
			throw new Error("Command didn't started, cannot set data.");
		}
		command.data[key] = elem;
	}
	this.add = function(key, elem){
		if(!command.meta){
			throw new Error("Command didn't started, cannot add data.");
		}
		command.data[key] = command.data[key] || [];
		command.data[key].push(elem);
	}
	this.finish = function(){
		if(!command.meta){
			throw new Error("Command didn't started, cannot finish it.");
		}
		var command0 = command;
		command = {};
		return command0;
	}
}
