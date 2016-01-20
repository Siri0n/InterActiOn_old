var Bacon = require("baconjs");
require("bacon.model");


var Core = Bacon.Model({
	state: "menu",
	currentLevel: {
		height: 5,
		width: 6,
		exit: [5, 1],
		objects: [
			{
				type: "alpha",
				value: "α",
				position: [3, 2]
			},
			{
				type: "alpha",
				value: "β",
				position: [2, 2]
			},
			{
				type: "block",
				value: 2,
				position: [0, 2]
			},
			{
				type: "block",
				value: 1,
				position: [5, 4]
			}
		]
	}
});

var interfaceSkeleton = {
	menu: {
		play: 0,
		settings: 0
	},
	game: {
		click: 0
	}
}
function createInterface(skeleton){
	var buses = {}, pushes = {};
	Object.keys(skeleton).forEach(function(key){
		if(typeof skeleton[key] == "object"){
			[buses[key], pushes[key]] = createInterface(skeleton[key]);
		}else{
			buses[key] = Bacon.Bus();
			pushes[key] = buses[key].push.bind(buses[key]);
		}
	})
	return [buses, pushes];
}

var [buses, pushes] = createInterface(interfaceSkeleton);

var state = Core.lens("state");

state.addSource(
	buses.menu.play.map(() => "play")
);

state.addSource(
	buses.menu.settings.map(() => "settings")
);

var level = Core.lens("currentLevel");

level.apply(
	buses.game.click.map(i => function(level){
		var obj = level.objects[i];
		if(obj.type == "alpha"){
			return level;
		}else if(obj.type == "block"){
			var directions = [
				[0, 1], [1, 0], [0, -1], [-1, 0]
			];
			directions.forEach(function(d){
				var pos = _.clone(obj.position);
				add(pos, d);
				var toMove = [];
				while(inside(pos, level.width, level.height)){
					var subj = get(level.objects, pos);
					subj && subj.type == "alpha" && toMove.unshift(subj);
					add(pos, d);
				}
				toMove.forEach(function(subj){
					var i = obj.value;
					var next = sum(subj.position, d);
					while(!get(level.objects, next) && inside(next, level.width, level.height) && i--){
						add(subj.position, d);
						next = sum(subj.position, d);
					}
				})
			})
			return Object.assign({}, level);
		}
	})
)

function get(objects, arr){
	return _.find(objects, o => o.position[0] == arr[0] && o.position[1] == arr[1]);
}

function inside(arr, x, y){
	return arr[0] >= 0 && arr[0] < x && arr[1] >= 0 && arr[1] < y;
}
function add(arr1, arr2){
	arr1[0] += arr2[0];
	arr1[1] += arr2[1];
}
function sum(arr1, arr2){
	return [arr1[0]+arr2[0], arr1[1]+arr2[1]];
}
function isEmptySpace(objects, x, y, arr){
	return !get(objects, arr) && inside(arr, x, y);
}

window.Core = Core;
module.exports = {model: Core, events: pushes};