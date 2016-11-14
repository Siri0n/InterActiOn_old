var Phaser = require("phaser");
var Promise = require("bluebird");
var Signal = require("../util/signal");
var BoardUIController = require("./boardUIController");
var Scheduler = require("./scheduler");
var spellDescriptions = require("./spellDescriptions");

module.exports = function(players){
	var ui = this;
	var scheduler = new Scheduler(executeCommand);
	var started = false;

	function executeCommand(command){
		if(command.currentPlayer){
			ui.setCurrentPlayer(command.currentPlayer);
		}
		console.log("SPELL", command.spell);
		return Promise.all([
			...Promise.map(
				Object.keys(ui.players),
				key => command[key] && ui.players[key].executeCommand(command[key])
			),
			command.spell && command.spell.id && 
				ui.spellMessage.showText(spellDescriptions[command.spell.id])
		])
	} 

	this.obey = scheduler.schedule;
	this.onExecuteEnd = scheduler.onExecuteEnd;

	this.setCurrentPlayer = function(id){
		for(let key in ui.players){
			ui.players[key].g.alpha = (id == key ? 1 : 0.8);
		}
	}

	this.start = function(width, height){
		return new Promise(function(resolve, reject){
			var game = new Phaser.Game(width, height, Phaser.CANVAS, '');

			game.state.add("game", (function(){
				var data;
				return {
					init(data_){
						data = data_;
					},
					preload(){
						game.load.baseURL = "assets/";
						game.load.bitmapFont("default", "fonts/Book Antiqua_0.png", "fonts/Book Antiqua.fnt", null, 0, 0);
						game.load.image("cell", "cell.png");
						game.load.image("splash", "messageBackground.png");
						game.load.image("tokens/fire", "tokens/fire.png");
						game.load.image("tokens/water", "tokens/water.png");
						game.load.image("tokens/shit", "tokens/shit.png");
						game.load.start();
					},
					create(){
						game.stage.disableVisibilityChange = true;
						game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
						var main = new Game({game, data, rect: new Phaser.Rectangle(10, 10, game.width - 20, game.height - 20)});
						ui.players = main.players;
						ui.spellMessage = main.spellMessage;
						started = true;
						resolve();
					}
				}
			})());

			game.state.start("game", false, false, {
				cellSize: 64, 
				players
			});
		});
	}
}

function Game({game, data, rect}){
	var group = game.add.group();
	group.x = rect.x;
	group.y = rect.y;

	var players = this.players = {};
	data.players.forEach(
		function(player, index){
			players[player.id] = new PlayerSide({
				game,
				group,
				data: {
					player,
					boardSize: player.boardSize,
					cellSize: data.cellSize
				},
				rect: new Phaser.Rectangle(
					rect.width*index/data.players.length, 
					0, 
					rect.width/data.players.length, 
					rect.height
				)
			});
		}
	);

	var spellMessage = this.spellMessage = new SplashScreen({
		game,
		group,
		rect: new Phaser.Rectangle(
			rect.x + rect.width/4, 
			rect.y + rect.height/4,
			rect.width/2,
			rect.height/2
		)
	})
}

function SplashScreen({game, group, rect}){
	var g = game.make.image(rect.x, rect.y, "splash");
	group.add(g);
	g.scale.x = rect.width/g.width;
	g.scale.y = rect.height/g.height;
	var message = game.make.bitmapText(rect.width/2, rect.height/2, "default", "You shouldn't see it.\n Now you're cursed.", 32);
	message.anchor.x = message.anchor.y = 0.5;
	message.tint = 0;
	g.addChild(message);
	g.alpha = 0;
	this.showText = window.test = function(text){
		message.text = text;
		return new Promise(function(resolve, reject){
			game.add.tween(g)
			.to({alpha: 1}, 500, Phaser.Easing.Exponential.In, true)
			.chain(
				game.add.tween(g)
				.to({alpha: 0}, 500, Phaser.Easing.Exponential.In)
				.delay(300)
			).onComplete.add(resolve);
		});
	}
}

function PlayerSide({game, group, data, rect}){
	var self = this;
	var g = this.g = game.add.group();
	group.add(g);
	g.x = rect.x;
	g.y = rect.y;

	var playerStats = this.player = new PlayerStats({game, group: g, player: data.player});
	playerStats.g.anchor.x = 0.5;
	playerStats.g.x = rect.width/2;
	var boardRect = new Phaser.Rectangle(0, playerStats.g.height*2, rect.width, rect.height - playerStats.g.height*2);
	var board = this.board = new Board({game, group:g, data});
	var ratio = Math.min(boardRect.width/board.width, boardRect.height/board.height);
	board.g.scale.x = board.g.scale.y = ratio;
	board.g.x = boardRect.centerX - board.width*ratio/2;
	board.g.y = boardRect.centerY - board.height*ratio/2;

	this.board = new BoardUIController(board);

	this.executeCommand = function(command){
		command.health && playerStats.setHealth(command.health);
		return command.board && self.board.executeCommand(command.board);
	}
}

function PlayerStats({game, group, player:{name, health}}){
	var g = game.make.bitmapText(0, 0, "default", "", 32, group);
	group.add(g);
	this.g = g;
	render();
	this.setHealth = function(newHealth){
		health = newHealth;
		render();
	}
	function render(){
		g.text = `${name}: ${health} health`;
	}
}

function Board({game, group, data}){
	var board = this;
	var g = this.g = game.add.group();
	group.add(g);
	var backgroundLayer = game.add.group();
	var tokensLayer = game.add.group();
	g.add(backgroundLayer);
	g.add(tokensLayer);

	var c = data.cellSize;
	var n = data.boardSize;

	this.width = this.height = n*c;
	this.onTokenClick = new Signal();
	this.onTokenHover = new Signal();

	for(let i = 0; i < n; i++){
		for(let j = 0; j < n; j++){
			backgroundLayer.add(
				game.make.image(i*c, j*c, "cell")
			)
		}
	}

	var tokens = this.tokens = Object.create(null);

	var mask = game.add.graphics(0, 0);
	mask.isMask = true;
	g.add(mask);
	mask.beginFill(0xffffff);
	mask.drawRect(0, 0, this.width, this.height);
	mask.endFill();

	function removeToken(id){
		delete tokens[id];
	}

	this.createToken = function(x, y, {id, type}){
		var token = new Token(
			{
				game, 
				group: tokensLayer, 
				id,
				type, 
				pos: {x, y}, 
				cellSize: c, 
				mask, 
				api:
				{
					remove: removeToken,
					click: board.onTokenClick.dispatch
				}
			}
		);
		tokens[id] = token;
		return token;
	}

}

function Token({game, group, id, type, pos, cellSize, mask, api}){
	var self = this;
	var c = cellSize;
	var g = game.make.image(pos.x*cellSize, pos.y*c, "tokens/" + type);
	const time = 500;
	const easing = Phaser.Easing.Quadratic.InOut;
	group.add(g);
	g.inputEnabled = true;
	g.events.onInputDown.add(function(_, pointer){
		if(pointer.rightButton.isDown){
			return api.click({
				type: "cast",
				x: pos.x,
				y: pos.y
			});
		}else{
			return api.click({
				type: "make",
				x: pos.x,
				y: pos.y
			});
		}
	});
	g.mask = mask;
	this.pos = pos;
	this.moveTo = function(x, y){
		return new Promise(function(resolve, reject){
			game.add.tween(g).to({x: x*c, y: y*c}, 100*game.math.distance(x, y, pos.x, pos.y), 
				easing, true)
			.onComplete.add(function(){
				pos = {x, y};
				resolve();
			})

		});
	}
	this.destroy = function(){
		g.destroy();
		mask.isMask = true; //dirty hack for dirty case
		api.remove(id);
	}
	this.fadeIn = function(){
		return new Promise(function(resolve, reject){
			game.add.tween(g).from({alpha: 0}, time, easing, true)
			.onComplete.add(resolve);
		});
	}
	this.fadeOut = function(){
		return new Promise(function(resolve, reject){
			game.add.tween(g).to({alpha: 0}, time, easing, true)
			.onComplete.add(resolve);
		});
	}
	this.fadeTo = function(x, y){
		return new Promise(function(resolve, reject){
			game.add.tween(g).to({x: x*c, y: y*c, alpha:0}, 100*game.math.distance(x, y, pos.x, pos.y), "Linear", true)
			.onComplete.add(function(){
				pos = {x, y};
				resolve();
			})

		});
	}
}