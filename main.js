var Graphics = require("./graphics");
var Promise = require("bluebird");
var g = new Graphics();

const size = 7;

var planRaw = [
	"x     x" +
	"x    x " +
	"x   x  " +
	"xxxx   " +
	"x   x  " +
	"x    x " +
	"x     x",

	"  xxx  " +
	" x   x " +
	"x     x" +
	"x     x" +
	"xxxxxxx" +
	"x     x" +
	"x     x",

	"xxxxxxx" +
	"   x   " +
	"   x   " +
	"   x   " +
	"   x   " +
	"   x   " +
	"   x   ",

	"x  xxx " +
	"x x   x" +
	"x x   x" +
	"xxx   x" +
	"x x   x" +
	"x x   x" +
	"x  xxx ",

	"x  x  x" +
	"x  x  x" +
	"x  x  x" +
	"x  x  x" +
	"x  x  x" +
	"x  x  x" +
	"xxxxxxx",

	"  xxx  " +
	" x   x " +
	"x     x" +
	"x     x" +
	"xxxxxxx" +
	"x     x" +
	"x     x",

	"xxxxxxx" +
	"   x   " +
	"   x   " +
	"   x   " +
	"   x   " +
	"   x   " +
	"   x   ",

	"x     x" +
	"x     x" +
	"x     x" +
	"xxxx  x" +
	"x   x x" +
	"x   x x" +
	"xxxx  x",

	"x     x" +
	"x     x" +
	"x     x" +
	"xxxxxxx" +
	"x     x" +
	"x     x" +
	"x     x",

	" xxxxxx" +
	"x     x" +
	"x     x" +
	" x    x" +
	"  xxxxx" +
	" x    x" +
	"x     x",

	"x  x  x" +
	"x  x  x" +
	"x  x  x" +
	"x  x  x" +
	"x  x  x" +
	"x  x  x" +
	"xxxxxxx",

	"  xxx  " +
	" x   x " +
	"x     x" +
	"x     x" +
	"xxxxxxx" +
	"x     x" +
	"x     x"
]


var plan = planRaw.map(function(str){
	var coords = [];
	var arr = str.split("");
	arr.forEach(function(elem, index){
		if(elem != " "){
			coords.push([index % size, Math.floor(index / size)]);
		}
	})
	return coords;
})


g.start(900, 600).then(function(){
	Promise.reduce(plan, step, g.board);
})


function step(board, coords){
	shuffle(coords);
	var i = 0;
	var promises = [];
	while(board.tokens[i] && coords[i]){
		console.log("move");
		promises.push(
			board.tokens[i].moveTo(...coords[i])
		);
		i++;
	}
	while(board.tokens[i]){
		console.log("destroy");
		let token = board.tokens[i];
		promises.push(
			board.tokens[i].fadeOut()
			.then(() => token.destroy())
		);
		i++;
	}
	while(coords[i]){
		console.log("create");
		let token = board.createToken(...coords[i], "fire");
		promises.push(
			token.fadeIn()
		);
		i++;
	}
	return Promise.all(promises).then(() => board);
}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}