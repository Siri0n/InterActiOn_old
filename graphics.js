var Phaser = require("phaser");
var Promise = require("bluebird");

module.exports = function(){
	var graphics = this;

	this.start = function(width, height){
		return new Promise(function(resolve, reject){
			var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

			game.state.add("game", (function(){
				var data;
				return {
					init(data_){
						data = data_;
					},
					preload(){
						game.load.image("cell", "assets/cell.png");
						game.load.image("tokens/fire", "assets/tokens/fire.png");
						game.load.image("tokens/water", "assets/tokens/water.png");
						game.load.start();
					},
					create(){
						game.stage.disableVisibilityChange = true;
						var main = new GameGfx({game, data, rect: new Phaser.Rectangle(0, 0, game.width, game.height)});
						graphics.board = main.board;
						resolve();
					}
				}
			})());

			game.state.start("game", false, false, {cellSize: 64, fieldSize: 7});
		});
	}
}

function GameGfx({game, data, rect}){
	var group = game.add.group();
	group.x = rect.x;
	group.y = rect.y;

	var board = this.board = new BoardGfx({game, group, data});
	var ratio = Math.min(rect.width/board.width, rect.height/board.height);
	board.g.scale.x = board.g.scale.y = ratio;
	board.g.x = (rect.width - board.width*ratio)/2;
	board.g.y = (rect.height - board.height*ratio)/2;
}

function BoardGfx({game, group, data}){
	var g = game.add.group();
	group.add(g);
	var backgroundLayer = game.add.group();
	var tokensLayer = game.add.group();
	g.add(backgroundLayer);
	g.add(tokensLayer);

	var c = data.cellSize;
	var n = data.fieldSize;

	this.width = this.height = n*c;
	this.g = g;

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
		var token = new TokenGfx(
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
					remove: removeToken
				}
			}
		);
		tokens[id] = token;
		return token;
	}

}

function TokenGfx({game, group, id, type, pos, cellSize, mask, api}){
	var self = this;
	var c = cellSize;
	var g = game.make.image(pos.x*cellSize, pos.y*c, "tokens/" + type);
	const time = 1000;
	const easing = Phaser.Easing.Quadratic.InOut;
	group.add(g);
	g.mask = mask;
	this.pos = pos;
	this.moveTo = function(x, y){
		return new Promise(function(resolve, reject){
			game.add.tween(g).to({x: x*c, y: y*c}, time/*100*game.math.distance(x, y, pos.x, pos.y)*/, 
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

/*function AnimationManager(game){
	this.onAnimationEnded
}*/