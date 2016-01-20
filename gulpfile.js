var gulp = require('gulp');
var watch = require("gulp-watch");
var browserify = require("browserify");
var watchify = require("watchify");
var source = require("vinyl-source-stream");
var less = require("gulp-less");
var express = require("express");

var b = browserify({
	entries: ["main.js"],
	debug: true,
	plugin: ["watchify"]
}).transform(
	"babelify", 
	{
		presets: ["es2015", "react"]
	}
);

b.on("update", bundle);
gulp.task("browserify", bundle);

function bundle(){
	console.log("Transforming...");
	return b.bundle()
		.on("error", console.log.bind(console, "error"))
		.on("end", console.log.bind(console, "Transform was successful"))
		.pipe(source("bundle.js"))
		.pipe(gulp.dest("./"));
}

gulp.task("less", function(){
	return gulp.src("css/*.less")
		.pipe(less())
		.on("error", console.log.bind(console, "less error"))
		.on("end", console.log.bind(console, "less end"))
		.pipe(gulp.dest("./"));
})

gulp.watch("css/*.less", ["less"])
gulp.task("default", ["browserify", "less"]);

var app = express();
app.use(express.static("./"));
app.listen(3435);