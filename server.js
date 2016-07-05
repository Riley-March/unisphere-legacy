var express = require('express');
var request = require('request');
var path = require('path');
var mysql = require('mysql');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var nodemailer = require("nodemailer");
var database = require('./server_modules/database.js');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var formidable = require('formidable');
var util = require('util');
var multer = require('multer');
var jsftp = require('jsftp');
var multiparty = require('multiparty');
var uuid = require('uuid');

var app = express();
var tokens = [];
var secret = 'this is the secret secret secret 12356';
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var connection = database.dbConnect();
var admins = ["riley.march@my.jcu.edu.au", "aiden.deloryn@my.jcu.edu.au", "sidney.devries@my.jcu.edu.au"];
app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.static(path.join(__dirname, 'client_modules')));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	})); 
	app.use(multer({ dest: './uploads/'}));
});

app.use('/api', expressJwt({secret: secret}));

app.use(favicon(__dirname + '/public/favicon.ico'));

function removeFromTokens(token) {
    for (var counter = 0; counter < tokens.length; counter++) {
        if (tokens[counter] === token) {
            tokens.splice(counter, 1);
            break;
        }
    }
}

var ftp = new jsftp({
	host: "wlc1www46.webland.ch",
	port: 21,
	user: "www46",
	pass: "9XnHnRBM"
});

app.get('/', function (req, res) {
	res.sendfile("./public/html/index.html");
});

app.get('/eula', function (req, res) {
	res.sendfile("./public/html/eula.html");
});

app.post('/loadProfiles', function (req, res) {
	var token = req.body.token;
	var decodedToken = jwt.decode(token);
	var userEmail = decodedToken.email;
	database.getProfiles(userEmail, function(data){
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

app.post('/loadProfileEmail', function (req, res) {
	var email = req.body.id;
	database.loadProfileEmail(email, function(data){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	});
});

app.post('/loadPosts', function (req, res) {
	var token = req.body.token;
	var decodedToken = jwt.decode(token);
	var emailFrag = req.body.emailFrag;
	var email = decodedToken.email;
	database.getPosts(emailFrag, email, function(data){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	});
});

app.post('/newPost', function (req, res) {
	var time = new Date();
	var token = req.body.token;
	var decodedToken = jwt.decode(token);
	var post = {
		POST_USERNAME: decodedToken.name,
		POST_USERID: decodedToken.id,
		POST_TEXT: req.body.message,
		POST_TIME: time.getTime(),
		emailFrag: decodedToken.emailFrag,
		email: decodedToken.email
	};
	database.newPost(post);
	res.json({post: post});
});

app.post('/authenticate', function(req, res){
	var email = req.body.email;
	var password = req.body.password;
	database.authenticateUser(email, password, function(error, data){
		if(error){
		res.send(400, "Incorrect Username/Password");	
		}else if(data != null){
			var level = "user";
			for(var i = 0; i < admins.length; i++){
				if(data[0].USER_EMAIL == admins[i]){
					level = "admin";
				}
			}
			var tokenData = {
				id: data[0].USER_ID,
				email: data[0].USER_EMAIL,
				name: data[0].USER_NAME,
				emailFrag: data[0].USER_EMAIL_FRAG
			}
			var token = jwt.sign(tokenData, secret, { expiresInMinutes: 60*5 }, { algorithm: 'RS256'});
			tokens.push(token);
			res.json(200, {token: token, id: data[0].USER_ID, emailFrag: data[0].USER_EMAIL_FRAG, name: data[0].USER_NAME, accessLevel: level});
		}
		res.send(400, "Incorrect Username/Password");
	});	
});

app.post('/logout', function(req, res){
	var token = req.headers.token;
	removeFromTokens(token);
    res.send(200);
});

app.post('/addUser', function(req, res){
	var keypin = Math.floor((Math.random() * 9999) + 1000);
	var email = req.body.email;
	var emailFrag = email.split("@", 2);
	var file = req.body.photo;
	var user = {
			email: req.body.email,
			name: req.body.name,
			alias: req.body.alias,
			description: req.body.description,
			keycode: keypin,
			emailFrag: emailFrag[1]
	};
	function decodeBase64Image(dataString) {
		var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
	    response = {};
	  	if (matches.length !== 3){
	  		return new Error('Invalid input string');
	  	}
	  	response.type = matches[1];
	  	response.data = new Buffer(matches[2], 'base64');
	  	return response;
	}
	var transporter = nodemailer.createTransport({
        service: "gmail",
        auth:{
            user: "unisphere.keys@gmail.com",
            pass: "unisphere123"
        }
    });
    var text = "To continue your registration please enter this code to continue.\n\n" + keypin;
    var mailOptions = {
        from: 'Admin@Unisphere',
        to: user.email,
        subject: "Confirm Account",
        text: text
    };
	database.checkEmail(user.email, function(err, userExists){
		if(userExists){
			res.send(400, "Email Already Exists");
		}else{
			database.addUser(user);
			transporter.sendMail(mailOptions, function(error, info){
				if(error){
					console.log(error);
		        }
		    });
		    var imageBuffer = decodeBase64Image(file);
		    database.loadProfileEmail(user.email, function(err, data){
				fs.writeFile('./uploads/profile_image' + data[0].USER_ID + '.png', imageBuffer.data, function(err){
					if(err){
						console.log(err);
					}
					ftp.put('./uploads/profile_image' + data[0].USER_ID + '.png', '/unisphere/php/images/profile_images/profile_image_' + data[0].USER_ID + '.png', function(hadErr) {
						if (hadErr){
							console.log(hadErr);
							console.error('There was an error retrieving the file.');
						}
						fs.unlinkSync('./uploads/profile_image' + data[0].USER_ID + ".png");
					});
				});
		    });
			res.json({keypin: keypin});
		}
	});
});

app.post('/confirmUser', function(req, res){
	var keypin = req.body.keypin;
	var email = req.body.email;
	database.confirmCode(email, keypin, function(data){
		res.send(200);
	});
});

app.post('/updateProfile', function(req, res){
	var updatedUser = {
		id: req.body.id,
		name: req.body.name,
		alias: req.body.alias,
		description: req.body.description
	};
	database.updateProfile(updatedUser);
	res.send(200);
});

app.post('/sendPassword', function(req, res){
	var email = req.body.email;
	database.checkEmail(email, function(err, userExists){
		if(userExists){
			database.loadProfileEmail(email, function(error, data){
				if(error){
					res.send(400, "Please try again later");
				}else{
					var transporter = nodemailer.createTransport({
				        service: "gmail",
				        auth:{
				            user: "unisphere.keys@gmail.com",
				            pass: "unisphere123"
				        }
				    });
				    var text = "Your password is: " + data[0].USER_KEYPIN + ".\n\n If you didnt request your password please disregard this message";
				    var mailOptions = {
				        from: 'Admin@Unisphere',
				        to: email,
				        subject: "Unisphere Password",
				        text: text
				    };
				    transporter.sendMail(mailOptions, function(error, info){
				        if(error){
				            console.log(error);
				        }
				    });
				    res.json(200);
				}				
		    });
		}else{
			res.send(400, "Account Doesnt Exist");
		}
	});
});

app.post('/loadEvents', function(req, res){
	var token = req.body.token;
	var decodedToken = jwt.decode(token);
	var email = decodedToken.email;
	var emailFrag = req.body.emailFrag;
	database.loadEvents(email, emailFrag, function(data){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	});
});

app.post('/uploadFile', function(req, res){
	console.log(req.files);
});

app.post('/loadComments', function(req, res){
	var postId = req.body.postID;
	var type = req.body.type;
	database.loadComments(postId, type, function(data){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	});
});

app.post('/newEvent', function(req, res){
	var newEvent = {
		USER_ID: req.body.userId,
		USER_NAME: req.body.userName,
		EVENT_NAME: req.body.eventName,
		EVENT_DESCR: req.body.description,
		EVENT_EMAIL_FRAG: req.body.emailFrag,
		EVENT_TIME: req.body.time
	};
	database.createEvent(newEvent);
	res.json({event: newEvent});
});

app.post('/newComment', function(req, res){
	var time = new Date();
	var newComment = {
		postId: req.body.postId,
		COM_USER: req.body.userName,
		COM_TXT: req.body.message,
		COM_TIME: time.getTime(),
		type: req.body.type
	};
	database.newComment(newComment);
	res.json({comment: newComment});
});

app.post('/upvotePost', function(req, res){
	var decodedToken = jwt.decode(req.body.token);
	var newVote = {
		postId: req.body.postId,
		email: decodedToken.email
	}
	database.upvotePost(newVote);
	res.send(200);
});

app.post('/downVotePost', function(req, res){
	var decodedToken = jwt.decode(req.body.token);
	var deleteVote = {
		postId: req.body.postId,
		email: decodedToken.email
	}
	database.downVotePost(deleteVote);
	res.send(200);
});

app.post('/joinEvent', function(req, res){
	var decodedToken = jwt.decode(req.body.token);
	var newJoin = {
		eventId: req.body.eventId,
		email: decodedToken.email
	}
	database.joinEvent(newJoin);
	res.send(200);
});

app.post('/leaveEvent', function(req, res){
	var decodedToken = jwt.decode(req.body.token);
	var newLeave = {
		eventId: req.body.eventId,
		email: decodedToken.email
	}
	database.leaveEvent(newLeave);
	res.send(200);
});

app.get('/numberComments', function(req, res){
	database.getNumberComments(function(data){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	});
});

app.post('/upvotePeople', function(req, res){
	var decodedToken = jwt.decode(req.body.token);
	var newVote = {
		userId: req.body.userId,
		email: decodedToken.email
	}
	database.upvotePeople(newVote);
	res.send(200);
});

app.post('/downvotePeople', function(req, res){
	var decodedToken = jwt.decode(req.body.token);
	var newVote = {
		userId: req.body.userId,
		email: decodedToken.email
	}
	database.downvotePeople(newVote);
	res.send(200);
});

app.post('/uploadImage', function(req, res){
	var file = req.body.file;
	var profileNumber = 2000;
	function decodeBase64Image(dataString) {
		var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
	    response = {};
	  	if (matches.length !== 3) {
		  return new Error('Invalid input string');
	  	}
	  	response.type = matches[1];
	  	response.data = new Buffer(matches[2], 'base64');
	  	return response;
	 }
	var imageBuffer = decodeBase64Image(file);
	fs.writeFile('./uploads/profile_image' + profileNumber + '.png', imageBuffer.data, function(err){
		if(err){
			console.log(err);
		}
		ftp.put('./uploads/profile_image' + profileNumber + '.png', '/unisphere/php/images/profile_images/profile_image_' + profileNumber + '.png', function(hadErr) {
			if (hadErr){
				console.log(hadErr);
				console.error('There was an error retrieving the file.');
			}
		    else{
		    	console.log('File copied successfully!');
		    }
		});
	});
});

app.get('/getReports', function(req, res){
	database.getReports(function (data){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	});
});

app.post('/newReport', function(req, res){
	var report = {
		reporterName: req.body.reporterName,
		reporterId: req.body.reporterId,
		reporteeName: req.body.reporteeName,
		reporteeId: req.body.reporteeId,
		reportText: req.body.reportText,	
	};
	database.newReport(report);
	res.send(200);
});

app.post('/deleteUser', function(req, res){
	database.deleteUser(req.body.userId);
	database.deleteReports(req.body.userId);
	database.deleteUserPosts(req.body.userId);
	database.deleteUserComments(req.body.userId);
	database.deleteUserEvents(req.body.userId);
	res.send(200);
});

app.post('/deleteReport', function(req, res){
	database.deleteReport(req.body.reportId);
	res.send(200);
});

var server = app.listen(server_port, server_ip_address, function () {
  console.log("Listening on " + server_ip_address + ", server_port " + server_port)
});
