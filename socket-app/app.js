//require necessary modules 
var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
require('dotenv').config();
var expressValidator = require('express-validator');
var hbs = require('express-handlebars');
var engines = require('consolidate');


app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

app.use(expressValidator());


app.engine('html', engines.handlebars);
app.engine('hbs', engines.handlebars);
app.set('view engine', 'hbs');


var regErrors = require('./errorHandlers/regErrorHandler');

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
	res.render('index.html');
	
});

//registration handling 
app.post('/register', function(req, res, next){
	
	
	//registration validation rules
	
	req.checkBody('username', 'Username field cannot be empty.').notEmpty();
	req.checkBody('username', 'Username must be between 4-15 characters long.').len(4, 15);
	req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
	req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
	req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
	req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
	req.checkBody('confirmPass', 'Password must be between 8-100 characters long.').len(8, 100);
	req.checkBody('confirmPass', 'Passwords do not match, please try again.').equals(req.body.password);

	// Additional validation to ensure username is alphanumeric with underscores and dashes
	req.checkBody('username', 'Username can only contain letters, numbers, or underscores.').matches(/^[A-Za-z0-9_-]+$/, 'i');

	
	
	
	//check for errors
	
	const errors = req.validationErrors();
	
	
	//current error handling 
	if(errors){
		console.log('errors: ' + JSON.stringify(errors));
		
		//res.send('errors: ' + JSON.stringify(errors));
		
		regErrors.errorsToHandle = JSON.stringify(errors);
		
		
		res.render('login.html', {
			title:'Registration error',
			errors: 'error occured'
		});
	}else{
		const username = req.body.username;
		const email = req.body.email;
		const pass = req.body.password;
	
		connection.query('INSERT INTO users(username,emailAddress,passHash) VALUES(?, ?, ?)', [username,email,pass], function(error, results, fields){
			if (error){
				
				console.log(error);
				
				
				
				
			};
		});
	
	//if there are no errors after the new user is inserted into the database
	//send the user back to the main page
	res.render('index.html');
	
	};
});

app.get('/login', function(req, res, next){
	res.render('login.html', {layout:false});
	console.log('login requested');
});

app.get('/errorCheck', function(req, res, next){
	res.send(regErrors.errorsToHandle);
	
	regErrors.errorsToHandle = null;
	console.log('');
	console.log('');
	console.log(regErrors.errorsToHandle);
});


//start server
app.listen(4200, function(){
	console.log("Server started WOO!!!!")
});