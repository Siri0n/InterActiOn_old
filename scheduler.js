var Signal = require("./signal");
var Promise = require("bluebird");

module.exports = function(execute){
	var scheduler = this;
	var commands = [];
	var executing = false;

	(this.onExecuteStart = new Signal())
	.on(() => executing = true);
	(this.onExecuteEnd = new Signal())
	.on(() => executing = false);


	this.abort = function(){
		commands = [];
	}
	
	this.mute = false;

	this.schedule = function(command){
		console.log("schedule", command);
		if(scheduler.mute){
			return;
		}
		commands.push(command);
		if(executing){
			return;
		}
		scheduler.onExecuteStart.dispatch();
		executeCommands()
		.then(() => scheduler.onExecuteEnd.dispatch())
		.catch(function(err){
			console.log(err);
			scheduler.abort(); 
			scheduler.onExecuteEnd.dispatch()
		});
	}
	
	function executeCommands(){
		var command = commands.shift();
		if(command){
			return execute(command)
			.then(executeCommands)
		}else{
			return Promise.resolve();
		}
	}
}