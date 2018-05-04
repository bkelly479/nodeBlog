var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/node_modules'));

app.use(express.static('public'));
app.use(express.static('views'));

app.get('/', function (req, res,next) {
	res.sendFile('/views/index.html', {root:__dirname});
	
});


server.listen(4200, function(){
	console.log("Server started WOO!!!!")
});