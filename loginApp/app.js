var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

//Init app
var app = express();

//View engine
app.set('views', path.join(__dirname, 'views'));
//setting handlebars as the engine, specifying that the default layout will be called layout
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//set static folder
//we'll put things like stylesheets, images, jquery in this folder, seems similar to the assets folder i've been using
app.use(express.static(path.join(__dirname, 'public')));

//express session middleware
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

//passport init
app.use(passport.initialize());
app.use(passport.session());

//validator middleware-- this code is straight from the validator github page
app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
			var namespace = param.split(',')
			, root = namespace.shift()
			, formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param 	: formParam,
			msg		: msg,
			value	: value 
		};
	}
}));

//connect flash middleware
app.use(flash());

//global variables for flash messages
app.use(function (req, res, next) {
		//res.locals is a global variable??
		res.locals.success_msg = req.flash('success_msg');
		res.locals.error_msg = req.flash('error_msg');
		//the line below is for passport's own error messages
		res.locals.error = req.flash('error');
		//"if the user is there" (where?) "we'll be able to access the user from anywhere, if not this will just be null" -- i don't get this
		res.locals.user = req.user || null;
		next();
});

app.use('/', routes);
app.use('/users', users);

//set port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function() {
	console.log('Server started on port ' + app.get('port'));
});