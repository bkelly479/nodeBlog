//require necessary modules 
var express = require('express');
var app = express();
var mysql = require('mysql');

//use the public and views folders
app.use(express.static('public'));
app.use(express.static('views'));


//default path, sends index html
app.get('/', function (req, res,next) {
	res.send('/views/index.html', {root:__dirname});
	
});


//test rout 
app.get('/test', function(req,res,next){
	res.send('hello there');
});



//start server
app.listen(4200, function(){
	console.log("Server started WOO!!!!")
});