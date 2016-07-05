var express = require('express');
var path = require('path');
var mysql = require('mysql');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var nodemailer = require("nodemailer");
var database = require('./server_modules/database.js');
var bodyParser = require('body-parser');
var app = express();
var done=false;

app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.static(path.join(__dirname, 'client_modules')));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	})); 
});

var tokens = [];
var secret = 'this is the secret secret secret 12356';

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.use('/api', expressJwt({secret: secret}));

var connection = database.dbConnect();

function removeFromTokens(token) {
    for (var counter = 0; counter < tokens.length; counter++) {
        if (tokens[counter] === token) {
            tokens.splice(counter, 1);
            break;
        }
    }
}

app.get('/', function (req, res) {
	res.sendfile("./public/html/index.html");
});

app.get('/loadProfiles', function (req, res) {
	database.getProfiles(function(data){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	});
});

app.post('/loadProfile', function (req, res) {
	var id = req.body.id;
	database.loadProfile(id, function(data){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	});
});

app.get('/loadPosts', function (req, res) {
	database.getPosts(function(data){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	});
});

app.post('/newPost', function (req, res) {
	var time = new Date();
	var token = req.body.token;
	var decodedToken = jwt.decode(token);
	var post = {
		name: decodedToken.name,
		message: req.body.message,
		time: time.getTime(),
		emailFrag: decodedToken.emailFrag,
		email: decodedToken.email
	};
	database.newPost(post);
	res.json({post: post});
});

app.post('/authenticate', function(req, res){
	var email = req.body.email;
	var password = req.body.password;
	database.authenticateUser(email, password, function(data){
		console.log(data);
		var tokenData = {
			id: data[0].USER_ID,
			email: data[0].USER_EMAIL,
			name: data[0].USER_NAME,
			emailFrag: data[0].USER_EMAIL_FRAG
		}
		var token = jwt.sign(tokenData, secret, { expiresInMinutes: 60*5 }, { algorithm: 'RS256'});
		tokens.push(token);
		res.json(200, {token: token, id: data[0].USER_ID, emailFrag: data[0].USER_EMAIL_FRAG});
	});	
});

app.post('/logout', function(req, res){
	var token = req.headers.token;
	removeFromTokens(token);
    res.send(200);
});

app.post('/addUser', function(req, res){
	var keypin = Math.floor((Math.random() * 9999) + 1);
	var user = {
			email: req.body.email,
			name: req.body.name,
			alias: req.body.alias,
			description: req.body.description,
			keycode: keypin,
			emailFrag: req.body.email
	};
	var transporter = nodemailer.createTransport({
        service: "gmail",
        auth:{
            user: "unisphere.keys@gmail.com",
            pass: "unisphere123"
        }
    });
    var text = "To continue your registration please enter this code to continue.\n\n" +
        keypin;
    var mailOptions = {
        from: 'Admin@Unisphere',
        to: user.email,
        subject: "Confirm Account",
        text: text
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
    database.addUser(user);
    res.json({keypin: keypin});
});

app.post('/confirmUser', function(req, res){
	var keypin = req.body.keypin;
	var email = req.body.email;
	database.confirmCode(email, keypin, function(data){
		res.send(200);
	});
});


var server = app.listen(server_port, server_ip_address, function () {
  console.log("Listening on " + server_ip_address + ", server_port " + server_port)
});
