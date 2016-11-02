module.exports = function(){
	var self = this;

	this.command = Object.create(null);

	Accessor.call(self, self, "");
	this.access = function(path){
		return new Accessor(self, path);
	}
	this.finish = function(){
		console.log(self.command);
		var tmp = self.command;
		self.command = Object.create(null);
		return tmp;
	}
}

function Accessor(builder, path){
	this.set = function(key, value){
		if(key == "meta"){
			throw new Error("'meta' field is protected");
		}
		var target = get(builder.command, path);
		target[key] = value;
	}
	this.put = function(key, value){
		if(key == "meta"){
			throw new Error("'meta' field is protected");
		}
		var target = get(builder.command, path);
		if(!Array.isArray(target[key])){
			target[key] = [];
		}
		target[key].push(value);

	}
	this.meta = function(key, value){
		var target = get(builder.command, path);
		target.meta = target.meta || Object.create(null);
		target.meta[key] = value;
	}

}

function get(obj, path){
	var target = obj;
	path = path.split(".");
	var key;
	while(key = path.shift()){
		if(!target[key]){
			target[key] =  Object.create(null);
		}
		target = target[key];
	}
	return target;
}