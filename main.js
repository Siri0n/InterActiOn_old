var GraphicsController = require("./graphicsController");
var BoardController = require("./boardController");
var Promise = require("bluebird");

const size = 7;

var g = new GraphicsController();
var b = new BoardController(size, null, {fire: 5, water: 1});


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
	" xxxxxx" +
	"  x   x" +
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
	b.onCommand.on(g.obey);
	b.init();
})



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