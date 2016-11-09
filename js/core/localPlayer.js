var Promise = require("bluebird");

module.exports = function(id, UIEvents){
	this.nextTurn = function(){
		return new Promise(function(resolve, reject){
			UIEvents.addOnce(resolve);
		}).then(function(event){
			event.player = id;
			return event;
		});
	}
}