var Promise = require("bluebird");

module.exports = function(UIEvents){
	this.nextTurn = function(){
		return new Promise(function(resolve, reject){
			UIEvents.addOnce(resolve);
		}).then(function(event){
			//there may be some thansformation of event object. But now there's not.
			return event;
		});
	}
}