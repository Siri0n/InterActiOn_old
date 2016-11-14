module.exports = CommandBuilder;

function CommandBuilder(root, path){
	var self = this;

	if(!root){
		root = Object.create(null);
		path = "$";
		this.finish = function(){
			var tmp = root.$;
			root.$ = Object.create(null);
			return tmp;
		}
	}

	this.access = function(subpath){
		return new CommandBuilder(root, path + "." + subpath);
	}

	this.set = function(key, value){
		//console.log("set", key, value);
		if(key == "meta"){
			throw new Error("'meta' field is protected");
		}
		var target = get(root, path);
		target[key] = value;
	}

	this.put = function(key, value){
		//console.log("put", key, value);
		if(key == "meta"){
			throw new Error("'meta' field is protected");
		}
		var target = get(root, path);
		if(!Array.isArray(target[key])){
			target[key] = [];
		}
		target[key].push(value);
	}
	this.meta = function(key, value){
		//console.log("meta", key, value);
		var target = get(root, path);
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