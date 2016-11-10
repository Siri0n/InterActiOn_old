var Signal = require("../util/signal");
var CommandBuilder = require("./commandBuilder");
var seedrandom = require("seedrandom");

function GameController(spells, frequencies){
	var self = this;
	var commandBuilder = new CommandBuilder();
	var boards;
	var typeGen = new TokenTypeGenerator(frequencies);

	this.onCommand = new Signal();

	function initBoard(board){
		board.meta("type", "init");
		for(let i = 0; i < board.size; i++){
			for(let j = 0; j < board.size; j++){
				board.createToken(i, j, typeGen.getType());
			}
		}
	}

	function order(){
		self.onCommand.dispatch(commandBuilder.finish());
	}

	this.gameLoop = function(playerManager){
		return playerManager.turn()
			.then(self.handleTurn)
			.then(function(result){
				if(result.type == "next"){
					playerManager.next();
					commandBuilder.set("currentPlayer", playerManager.current());
					order();
					return self.gameLoop(playerManager);
				}else if(result.type == "repeat"){
					return self.gameLoop(playerManager);
				}else if(result.type == "end"){
					return result;
				}
			})
	}

	this.init = function({players, boardSize}){
		boards = {};
		
		for(let player of players){
			boards[player.id] = new Board(boardSize, commandBuilder.access(player.id));
			initBoard(boards[player.id]);
		}
		commandBuilder.set("currentPlayer", players[0].id);
		order();
	}
	this.handleTurn = function(turn){
		 return self.castSpell(turn);
	}
	this.castSpell = function({x, y, player}){
		var board = boards[player];
		board.destroyToken(x, y);
		board.destroyToken(x - 1, y);
		board.destroyToken(x, y - 1);
		board.destroyToken(x + 1, y);
		board.destroyToken(x, y + 1);
		order();
		self.fall(player);
		commandBuilder.set("endOfTurn", player);
		if(board.containsShit()){
			return {type: "next"};
		}else{
			return {type: "end", player};
		}
	}
	this.fall = function(player){
		var board = boards[player];
		board.meta("type", "fall");
		for(let i = 0; i < board.size; i++){
			let j = board.size - 1;
			while(j >= 0){
				if(board.getToken(i, j)){
					j--;
					continue;
				}else{
					let k = j - 1;
					while(k > 0 && !board.getToken(i, k)){
						k--;
					}
					if(board.getToken(i, k)){
						board.moveToken(i, k, i, j);
						j--;
					}else{
						break;
					}
				}
			}
			while(j >= 0){
				board.createToken(i, j, typeGen.getType());
				j--;
			}
		}
		order();
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

function Board(size, commandBuilder){
	var board = this;
	var tokens = [];
	var cache = new Cache();

	this.size = size;
	this.meta = commandBuilder.meta;
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