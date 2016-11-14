module.exports = {Local};

function Local(id, UIEvents){
	this.id = id;
	this.nextTurn = function(){
		return new Promise(function(resolve, reject){
			UIEvents.addOnce(resolve);
		}).then(function(event){
			event.player = id;
			return event;
		});
	}
}