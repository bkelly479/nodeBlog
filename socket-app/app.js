//require necessary modules 
var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
require('dotenv').config();
var expressValidator = require('express-validator');


app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

app.use(expressValidator());

//establish database connection with credentials specified in .env file
var connection = mysql.createConnection({
	
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
})

connection.connect();

//use the public and views folders
app.use(express.static('public'));
app.use(express.static('views'));


//default path, sends index html
app.get('/', function (req, res,next) {
	res.send('/views/index.html', {root:__dirname});
	
});


app.post('/register', function(req, res, next){
	
	req.checkBody('username', 'Username field cannot be empty.').notEmpty();
	
	const errors = req.validationErrors();
	
	if(errors){
		console.log('errors: ${JSON.stringify(errors)}');
		
		res.sendFile('views/login.html', {root:__dirname });
	}
	
	const username = req.body.username;
	const email = req.body.email;
	const pass = req.body.password;
	
	connection.query('INSERT INTO users(username,emailAddress,passHash) VALUES(?, ?, ?)', [username,email,pass], function(error, results, fields){
		if (error) throw error;
		
		res.send('/views/index.html');
	});
});


//start server
app.listen(4200, function(){
	console.log("Server started WOO!!!!")
});