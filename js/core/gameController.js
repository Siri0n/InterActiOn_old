var Signal = require("../util/signal");
var CommandBuilder = require("./commandBuilder");
var Player = require("./player");
var PlayerManager = require("./playerManager");
//var seedrandom = require("seedrandom");

const neighbours = [[1, 0], [0, 1], [-1, 0], [0, -1]];
function plus(v1, v2){
	return [v1[0]+v2[0], v1[1]+v2[1]];
}

function GameController(playersData){
	var self = this;
	var commandBuilder = this.commandBuilder = new CommandBuilder();
	var players = this.players = {};
	var playerManager;
	var spellBook = new SpellBook();

	this.onCommand = new Signal();

	this.init = function(){
		for(let data of playersData){
			let player = players[data.id] = new Player(data, commandBuilder.access(data.id));
			player.board.meta("type", "init");
			player.board.forEachCell(function(i, j){
				player.board.createToken(i, j, player.getRandomType());
			})
		}
		playerManager = self.playerManager = new PlayerManager(Object.keys(players).map(key => players[key]));
		commandBuilder.set("currentPlayer", playerManager.current().id);
		order();
	}

	this.currentPlayer = function(){
		return playerManager.current();
	}

	this.currentTarget = function(){
		return playerManager.target();
	}

	function order(){
		self.onCommand.dispatch(commandBuilder.finish());
	}

	this.order = order;
	this.gameLoop = function(){
		return playerManager.turn()
			.then(self.handleTurn)
			.then(function(result){
				if(result.type == "next"){
					playerManager.next();
					commandBuilder.set("currentPlayer", playerManager.current().id);
					self.currentPlayer().regenSpeed();
					order();
					return self.gameLoop();
				}else if(result.type == "repeat"){
					return self.gameLoop();
				}else if(result.type == "end"){
					return result;
				}
			})
	}

	this.handleTurn = function(turn){
		var repeat = spellBook.castSpell(self, turn);
		if(!self.currentTarget().dead){
			return {type: repeat ? "repeat" : "next"};
		}else{
			commandBuilder.set("winner", self.currentPlayer().id);
			order();
			return {type: "end", player:turn.player};
		}
		 //return spellBook.castSpell(self, turn);
	}
	this.destroyConnected = function(x, y, id){
		var board = players[id].board;
		var type = board.getToken(x, y).type;
		var coords = [[x, y]];
		var coord;
		var count = 0;
		while(coord = coords.shift()){
			let token = board.getToken(...coord);
			if(token && (token.type == type)){
				board.destroyToken(...coord);
				count++;
				neighbours.map(v => plus(v, coord)).forEach(v => coords.push(v));
			}
		}
		return {type, count};
	}
	this.fall = function(id){
		var player = players[id];
		var board = player.board;
		var falls = false;
		for(let i = 0; i < board.size; i++){
			let j = board.size - 1;
			while(j >= 0){
				if(board.getToken(i, j)){
					j--;
					continue;
				}else{
					falls = true;
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
				board.createToken(i, j, player.getRandomType());
				j--;
			}
			falls && board.meta("type", "fall");
		}
	}
	this.fallBoth = function(){
		self.fall(self.currentPlayer().id);
		self.fall(self.currentTarget().id);
	}
}

module.exports = GameController;

function SpellBook(){
	this.castSpell = function(api, {x, y, player}){
		var {type, count} = api.destroyConnected(x, y, player);
		var spell = spells[type][Math.min(index(count), spells[type].length - 1)];
		api.commandBuilder.set("spell", spell.name);
		var repeat = spell.effect(api, {x, y, player, count});
		api.order();
		api.fallBoth();
		api.order();
		return repeat;
	}
}

function index(count){
	return Math.ceil(Math.sqrt(count)) - 1;
}

var spells = {
	fire: [
		{
			name: "ember",
			effect(api, {x, y, player, count}){
				return api.currentPlayer().useSpeed();
			}
		},
		{
			name: "burningArrow",
			effect(api, {x, y, player, count}){
				api.currentTarget().damageShield(count);
				api.currentTarget().damage(Math.ceil(count/2));
			}
		},
		{
			name: "fireball",
			effect(api, {x, y, player, count}){
				api.currentTarget().damageShield(count);
				api.currentTarget().damage(count);
			}
		}
	],
	water: [
		{
			name: "droplet",
			effect(api, {x, y, player, count}){
				return api.currentPlayer().useSpeed();
			}
		},
		{
			name: "healingWater",
			effect(api, {x, y, player, count}){
				api.currentPlayer().heal(count);
			}
		},
		{
			name: "waterOfLife",
			effect(api, {x, y, player, count}){
				api.currentPlayer().increaseMaxHealth(2);
				api.currentPlayer().heal(count);
			}
		}
	],
	earth: [
		{
			name: "mote",
			effect(api, {x, y, player, count}){
				return api.currentPlayer().useSpeed();
			}
		},
		{
			name: "earthShield",
			effect(api, {x, y, player, count}){
				api.currentPlayer().addShield(count);
			}
		},
		{
			name: "blackCliffs",
			effect(api, {x, y, player, count}){
				api.currentPlayer().addShield(count);
				if(!api.currentTarget().stats.shield.value()){
					api.currentTarget().decreaseMaxHealth(3);
				}
			}
		}
	],
	air: [
		{
			name: "sparkle",
			effect(api, {x, y, player, count}){
				return api.currentPlayer().useSpeed();
			}
		},
		{
			name: "lightning",
			effect(api, {x, y, player, count}){
				api.currentTarget().damage(count);
			}
		},
		{
			name: "ballLightning",
			effect(api, {x, y, player, count}){
				api.currentTarget().damage(2*count - 4);
			}
		}
	]
}