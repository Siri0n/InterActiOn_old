module.exports = function(){
	var onCallbacks = [];
	var onceCallbacks = [];
	this.add = function(cb){
		onCallbacks.push(cb);
	}
	this.addOnce = function(cb){
		onceCallbacks.push(cb);
	}
	this.remove = function(cb){
		var i = onCallbacks.indexOf(cb);
		if(~i){
			onCallbacks.splice(i, 1);
			return true;
		}
		var i = onceCallbacks.indexOf(cb);
		if(~i){
			onceCallbacks.splice(i, 1);
			return true;
		}
		return false;
	}
	this.dispatch = function(...args){
		onCallbacks.forEach(cb => cb(...args));
		onceCallbacks.forEach(cb => cb(...args));
		onceCallbacks = [];
	}

}