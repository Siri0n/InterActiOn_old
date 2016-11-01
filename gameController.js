var Signal = require("./signal");
var seedrandom = require("seedrandom");

function GameController(size, spells, frequencies){
	var self = this;
	var boards;
	var typeGen = new TokenTypeGenerator(frequencies);

	this.onCommand = new Signal();

	function initBoard(board){
		board.commandBuilder.start({type: "init"});
		for(let i = 0; i < size; i++){
			for(let j = 0; j < size; j++){
				board.createToken(i, j, typeGen.getType());
			}
		}
		return board.commandBuilder.finish();
	}

	this.init = function(...players){
		boards = {};
		var command = {};
		for(let player of players){
			boards[player] = new Board(size);
			command[player] = initBoard(boards[player]);
		}
		self.onCommand.dispatch(command);
	}
	this.handleTurn = function(turn){
		// if(turn.type == "make"){
		// 	return "end";
		// }else if(turn.type == "cast"){
			return self.castSpell(turn);
		// }
	}
	this.castSpell = function({x, y, player}){
		var currentBoard = boards[player];
		currentBoard.commandBuilder.start({});
		currentBoard.destroyToken(x, y);
		currentBoard.destroyToken(x - 1, y);
		currentBoard.destroyToken(x, y - 1);
		currentBoard.destroyToken(x + 1, y);
		currentBoard.destroyToken(x, y + 1);
		var command = {};
		command[player] = currentBoard.commandBuilder.finish();
		self.onCommand.dispatch(command);
		self.fall(player);
		if(currentBoard.containsShit()){
			return "next";
		}else{
			return "end";
		}
	}
	this.fall = function(player){
		var currentBoard = boards[player];
		currentBoard.commandBuilder.start({type: "fall"});
		for(let i = 0; i < size; i++){
			let j = size - 1;
			while(j >= 0){
				if(currentBoard.getToken(i, j)){
					j--;
					continue;
				}else{
					let k = j - 1;
					while(k > 0 && !currentBoard.getToken(i, k)){
						k--;
					}
					if(currentBoard.getToken(i, k)){
						currentBoard.moveToken(i, k, i, j);
						j--;
					}else{
						break;
					}
				}
			}
			while(j >= 0){
				currentBoard.createToken(i, j, typeGen.getType());
				j--;
			}
		}
		var command = {};
		command[player] = currentBoard.commandBuilder.finish();
		self.onCommand.dispatch(command);
	}
}

module.exports = GameController;

function TokenTypeGenerator(frequencies){
	var rnd = seedrandom("test");

	this.randomize = function(seed){
		rnd = seedrandom(seed);
	}

	this.getType = function(){
		var freq = Object.keys(frequencies).map(key => ({type: key, value: frequencies[key]}));
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

	this.moveToken = function(x0, y0, x1, y1){
		var token = board.getToken(x0, y0);
		if(token){
			token.x = x1;
			token.y = y1;
			cache.invalidate();
			commandBuilder.add("move", {id: token.id, x: x1, y: y1});
		}else{
			console.log("token not found at " + x + " " + y);
		}
	}

	this.destroyToken = function(x, y){
		var token = board.getToken(x, y);
		if(token){
			remove(tokens, token);
			cache.invalidate();
			commandBuilder.add("vanish", {id: token.id});
		}else{
			console.log("token not found at " + x + " " + y);
		}
	}

	this.createToken = function(x, y, type){
		var token = new Token(x, y, type);
		tokens.push(token);
		commandBuilder.add("create", {id: token.id, x, y, type});
	}

	this.containsShit = function(){
		return tokens.some(token => token.type == "shit");
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
