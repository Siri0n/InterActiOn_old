module.exports = Token;

function Token(x, y, type){
	this.x = x;
	this.y = y;
	this.type = type;
	this.id = generateNewId();
}

var lastId = 1;

function generateNewId(){
	return lastId++;
}