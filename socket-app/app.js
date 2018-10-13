//require necessary modules 
var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
require('dotenv').config();
var expressValidator = require('express-validator');
var hbs = require('express-handlebars');
var engines = require('consolidate');
var bcrypt = require('bcrypt');
var fs = require('fs');


var multer = require('multer');

const storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, 'public/images/uploads/');
	},
	filename: function(req, file, cb){
		cb(null, Math.random().toString(36).substr(2, 9)+ '-' + file.originalname);
	}
})


var upload = multer({storage: storage});

//salt rounds for hashing
var saltRounds = 10;




//body parser setup allows error checking
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());


//validator
app.use(expressValidator());


//render engine
app.engine('html', engines.handlebars);
app.engine('hbs', engines.handlebars);
app.set('view engine', 'hbs');




//used to handle post errors
var regErrors = require('./errorHandlers/regErrorHandler');
var articleErrors = require('./errorHandlers/articleErrorHandler');
var authorErrors = require('./errorHandlers/authorErrorHandler');

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
	
	console.log(req.isAuthenticated());
	console.log(req.user);
	
	console.log('auth');
	
	res.render('index.html');
	
});

//Authentification packages
var session = require('express-session');
var passport = require('passport');


app.use(session({
	secret: 'aahhtisonvjkeusa',
	resave: false,
	saveUninitialized: false,
	name: 'nodeBlogCookie'
}));

app.use(passport.initialize());
app.use(passport.session());



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
		
		
		//writes all errors to an seperate file in the errorHandlers directory
		//these are later read and sent back to the client in the error check rout
		regErrors.errorsToHandle = JSON.stringify(errors);
		
		
		res.render('login.html', {
			title:'Registration error',
			errors: 'error occured'
		});
	}else{
		const username = req.body.username;
		const email = req.body.email;
		const pass = req.body.password;
		
		bcrypt.hash(pass, saltRounds, function(err, hash){
			
			connection.query('INSERT INTO users(username,emailAddress,passHash) VALUES(?, ?, ?)', [username,email,hash], function(error, results, fields){
				
				if (error){
					
					console.log(error);
				}else{
					
					connection.query('SELECT LAST_INSERT_ID() as user_id', function(error, results, fields){
						
						
						
						if(error){
							console.log(error);
						}else{
							
							//console.log(results[0]);
							
							const userID = results[0];
							
							console.log(results[0]);
							
							req.login(results[0], function(err){
								if(err){
									console.log(err);
								}
								res.redirect('/');
								console.log('redirected');
							});
							
							//if there are no errors after the new user is inserted into the database
							//send the user back to the main page
							//res.render('index.html');	
						};
					});
				}
					
					
			});
		
		});
	
		
	
	};
});



app.get('/login', function(req, res, next){
	
	console.log(req.isAuthenticated());
	res.render('login.html', {layout:false});
	console.log('login requested');
});

//article upload page
app.get('/upload', function(req, res, next){
	res.render('uploadArticle.html');
	
});


//article upload handler
app.post('/uploadArticle', upload.single('articlePic'),function(req, res, next){
	
	//article validation rules
	req.checkBody('articleText', 'Article text field cannot be empty.').notEmpty();
	req.checkBody('articleDescript', 'Article discription field cannot be empty.').notEmpty();
	req.checkBody('date', 'Date field cannot be empty.').notEmpty();
	
	
	//check for errors
	
	const errors = req.validationErrors();
	
	
	//current error handling 
	if(errors){
		console.log('errors: ' + JSON.stringify(errors));
		
		
		//writes all errors to an seperate file in the errorHandlers directory
		//these are later read and sent back to the client in the error check rout
		articleErrors.articleErrorsToHandle = JSON.stringify(errors);
		
		
		res.render('uploadArticle.html', {
			title:'Registration error',
			errors: 'error occured'
		});
	}
	else{
		const author = req.body.author;
		
		//console.log(author);
		
		const title = req.body.articleTitle;
		const articleText = req.body.articleText;
		const articleDescript = req.body.articleDescript;
		const date = req.body.date;
		const pic = req.file.filename;
		
		/*
		console.log(title);
		console.log(articleText);
		console.log(articleDescript);
		console.log(date);
		console.log(pic);
		*/

		
		connection.query("SELECT author.id FROM author WHERE author.name = '" + author +"';"  , function(error,results,field){
			
			if(error){
				console.log(error.code);
				
			}else{
				
				console.log('Results:');
				var authorID = results[0].id;
				console.log(authorID);
				
				var articleStorageName = Math.random().toString(36).substr(2, 9)+ '-' + title + ".txt";
				
				fs.writeFile("public/articleText/" + articleStorageName, articleText, function(err){
				if(err){
					return console.log(err);
				}
					console.log("File Saved!!1!")
				})
				
				console.log("INSERT INTO article(title,id,descript,imgloc,textloc,date) VALUES('?',?,'?','?','?','?')",[title,authorID,articleDescript,pic,articleStorageName,date]);
				
				connection.query("INSERT INTO article(title,authorid,descript,imgloc,textloc,date) VALUES( '" + title +"', "+ authorID +", '"+articleDescript+"', '"+pic+"', '"+articleStorageName+"', '"+date + "');", function(error, results, field){
					if(error){
						console.log(error);
				
					}else{
						
					}
				});
			}
			connection.release
		});
		
		
		res.render('uploadArticle.html');
		
	};
});

//send article errors to client
app.get('/articleErrorCheck', function(req, res, next){
	
	res.send(articleErrors.articleErrorsToHandle);
	
	articleErrors.articleErrorsToHandle = null;
	
});



//send registration errors to client
app.get('/errorCheck', function(req, res, next){
	res.send(regErrors.errorsToHandle);
	
	regErrors.errorsToHandle = null;
});


app.get('/addAuthor', function(req, res, next){
	res.render('addAuthor.html');
});

app.get('/authorErrorCheck', function(req, res, next){
	
	res.send(authorErrors.authorErrorsToHandle);
	
	authorErrors.authorErrorsToHandle = null;
	
});

app.post('/addAuthor', upload.single('Authorpic'), function(req, res, next){
	console.log(req.body.authorName);
	console.log(req.body.authorDescript);
	console.log(req.body.Authorpic);
	
	console.log(req.file);
	
	
	//article validation rules
	req.checkBody('authorName', 'Author name field cannot be empty.').notEmpty();
	req.checkBody('authorDescript', 'Author discription field cannot be empty.').notEmpty();
	//req.checkBody('Authorpic', 'Must upload a picture.').notEmpty();
	
	//check for errors
	
	const errors = req.validationErrors();
	
	
	//current error handling 
	if(errors){
		console.log('errors: ' + JSON.stringify(errors));
		
		
		//writes all errors to an seperate file in the errorHandlers directory
		//these are later read and sent back to the client in the error check rout
		authorErrors.authorErrorsToHandle = JSON.stringify(errors);
		
		
		res.render('addAuthor.html', {
			title:'Registration error',
			errors: 'error occured'
		});
	}else{
		var name = req.body.authorName;
		var descrpt = req.body.authorDescript;
		var imgPath = req.file.filename;
		
		connection.query('INSERT INTO author(NAME,IMGLOC,DESCRPT) VALUES(?,?,?);',[name,imgPath,descrpt], function(error,results,field){
			
			if(error){
				console.log(error.code);
				
			}
			connection.release
			
			console.log('author Added');
		});
	}
	
	res.render('addAuthor.html');
	
	
});


app.get('/getArticles', function(req,res,next){
	connection.query("SELECT * FROM ARTICLE ORDER BY id DESC LIMIT 10", function(error,results,field){
		if(error){
			console.log(error)
		}else{
			res.send(results);
		}
	})
})

app.get('/goToArticle/:ID', function(req, res, next){
	
})
//var User = require('.../app/modles/user');
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user){
		done(null, user);
	})
});




//start server
app.listen(4200, function(){
	console.log("Server started WOO!!!!")
});