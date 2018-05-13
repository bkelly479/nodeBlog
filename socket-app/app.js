//require necessary modules 
var express = require('express');
var app = express();
var mysql = require('mysql');
require('dotenv').config();

//use the public and views folders
app.use(express.static('public'));
app.use(express.static('views'));


//default path, sends index html
app.get('/', function (req, res,next) {
	res.send('/views/index.html', {root:__dirname});
	
});





//start server
app.listen(4200, function(){
	console.log("Server started WOO!!!!")
});