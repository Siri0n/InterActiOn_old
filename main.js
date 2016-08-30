//var Phaser = require("phaser");

var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

game.state.add("game", (function(){
	var data;
	return {
		init(data_){
			data = data_;
		},
		preload(){
			game.load.image("cell", "assets/cell.png");
			game.load.start();
		},
		create(){
			var main = new Game({game, data, rect: new Phaser.Rectangle(0, 0, game.width, game.height)});
		}
	}
})())

game.state.start("game", false, false, {width: 6, height: 6});


function Game({game, data, rect}){
	var g = game.add.group();
	var field = new Field({game, group: g, data});
	var scale = Math.min(rect.width/field.width, rect.height/field.height);
	g.scale.x = g.scale.y = scale;
	g.x = rect.x + (rect.width - field.width*scale)/2;
	g.y = rect.y + (rect.height - field.height*scale)/2;

	field.generateTokens();
}


function Field({game, group, data}){
	var self = this;
	var background = game.add.group();
	var img = game.cache.getImage("cell");
	var w = this.tileWidth = img.width;
	var h = this.tileHeight = img.height;
	this.width = w*data.width;
	this.height = h*data.height;
	group.add(background);
	for(let i = 0; i < data.height; i++){
		for(let j = 0; j < data.width; j++){
			background.add(
				game.make.image(this.tileWidth*j, this.tileHeight*i, "cell")
			);
		}
	}
	
	var tokensLayer = game.add.group();
	group.add(tokensLayer);
	
	var tokens;
	
	this.generateTokens = function(){
		tokens = [];
		for(let i = 0; i < data.height; i++){
			for(let j = 0; j < data.width; j++){
				tokens.push(
					new Token({
						game, 
						group: tokensLayer, 
						data: {
							x: j,
							y: i,
							type: game.rnd.pick([
								"red",
								"green"
							])
						},
						grid: {h, w},
						events: {
							click: this.click
						}
					})
				);
			}
		}	
	}

	this.rotate = function(clockwise){
		if(clockwise){
			tokens.forEach(function(token){
				var {x, y} = token.position();
				token.moveTo({x: data.width - y - 1, y: x}, 500);
			})
		}else{
			//stub
		}
	}
	this.click = function(token){
		self.rotate(true);
	}
}

var colors = {
	green: 0x11ff11,
	red: 0xff1111
}

function Token({game, group, data, grid, events}){
	var self = this;
	
	var {h, w} = grid;
	var {x, y, value, type} = data;
	
	var g = game.make.graphics(x*w, y*h);
	group.add(g);
	
	g.lineStyle(3, 0, 1);
	g.beginFill(colors[type], 1);
	g.drawCircle(w/2, h/2, w/2);
	g.endFill();

	
	g.inputEnabled = true;
	g.events.onInputDown.add(function(){
		events.click(self);
	});
	
	this.position = function(){
		return {x, y};
	}
	this.moveTo = function(position, duration){
		game.add.tween(g)
			.to({x: position.x*w, y: position.y*h}, duration, "Linear", true)
			.onComplete.add(function(){
				({x, y} = position);
			});
	}
	
}