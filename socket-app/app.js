var express = require('express');
var app = express();
var mysql = require('mysql');


app.use(express.static('public'));
app.use(express.static('views'));

app.get('/', function (req, res,next) {
	res.send('/views/index.html', {root:__dirname});
	
});

app.get('/test', function(req,res,next){
	res.send('hello there');
});


app.listen(4200, function(){
	console.log("Server started WOO!!!!")
});