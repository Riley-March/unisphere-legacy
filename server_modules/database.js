var mysql = require('mysql');
var async = require('async');
var connection;
var testConnection;

function dbConnect() {
	connection = mysql.createConnection({
		host : 'mySQL19.webland.ch',
		user : 'thebi_unis_db',
		password : 'sidiboy95',
		database : 'thebi_unis_db'
	});

	connection.connect(function(err) {
		if (err) {
			console.error('error connecting: ' + err.stack);
			return;
		}
		console.log('connected as id ' + connection.threadId);
		console.log('Database Connected');
	});
}

function getProfiles(userEmail, callback) {
	connection.query('SELECT USER_ID, USER_NAME, USER_ALIAS, USER_DESCRIPTION, USER_EMAIL_FRAG FROM uni_users WHERE VERIFIED_NUM = 1', function(err, rows) {
		checkUserPeopleVoted(rows, userEmail, function(finalProfiles){
			callback(finalProfiles);
		});
	});
}

function checkUserPeopleVoted(profiles, userEmail, callback) {
	connection.query('SELECT * FROM uni_votes WHERE USER_EMAIL = (?)', userEmail, function(err, peopleVotes) {
		var newProfiles = [];
		for (var i = 0; i < profiles.length; i++) {
			profiles[i].hasVoted = 0;
			for (var j = 0; j < peopleVotes.length; j++) {
				if (profiles[i].USER_ID === peopleVotes[j].USER_ID) {
					profiles[i].hasVoted = 1;
				}
			}
			newProfiles[newProfiles.length] = profiles[i];
		}
		callback(newProfiles);
	});
}

function loadProfile(id, callback) {
	connection.query("SELECT * FROM uni_users WHERE USER_ID = (?)", [ id ],
			function(err, rows) {
				callback(rows);
			});
}

function loadProfileEmail(email, callback) {
	connection.query("SELECT * FROM uni_users WHERE USER_EMAIL = (?)", [email], function(err, rows) {
		if (err) {
			callback(err, null);
		}
		callback(null, rows);
	});
}

function getPosts(emailFrag, email, callback) {
	var posts = [];
	connection.query('SELECT * FROM uni_posts WHERE POST_EMAIL_FRAG = (?)', [ emailFrag ], function(err, posts) {
		getComments(posts, function(newPosts) {
			getVotes(newPosts, function(finalPosts){
				checkUserVoted(finalPosts, email, function(lastPosts){
					callback(lastPosts);
				});
			});
		});
	});
}

function getComments(posts, callback) {
	if(posts.length == 0){
		callback(posts);
	}else{
		var sqlQuery = 'SELECT * FROM uni_post_com WHERE POST_ID=' + posts[0].POST_ID;
		for(var i = 1; i < posts.length; i++){
			sqlQuery += ' OR POST_ID=' + posts[i].POST_ID;
		}
		connection.query(sqlQuery, function(err, comments) {
			var newPost = [];
			for (var i = 0; i < posts.length; i++) {
				posts[i].numberComments = 0;
				for (var j = 0; j < comments.length; j++) {
					if (posts[i].POST_ID === comments[j].POST_ID) {
						posts[i].numberComments += 1;
					}
				}
				newPost[newPost.length] = posts[i];
			}
			callback(newPost);
		});
	}
	
}

function getVotes(posts, callback) {
	if(posts == 0){
		callback(posts);
	}else{
		var sqlQuery = 'SELECT * FROM uni_votes_p WHERE POST_ID=' + posts[0].POST_ID;
		for(var i = 1; i < posts.length; i++){
			sqlQuery += ' OR POST_ID=' + posts[i].POST_ID;
		}
		connection.query(sqlQuery, function(err, votes) {
			var newPost = [];
			for (var i = 0; i < posts.length; i++) {
				posts[i].numberVotes = 0;
				for (var j = 0; j < votes.length; j++) {
					if (posts[i].POST_ID === votes[j].POST_ID) {
						posts[i].numberVotes += 1;
					}
				}
				newPost[newPost.length] = posts[i];
			}
			callback(newPost);
		});
	}
	
}

function checkUserVoted(posts, userEmail, callback) {
	if(posts == 0){
		callback(posts);
	}else{
		connection.query('SELECT * FROM uni_votes_p WHERE USER_EMAIL = (?)', userEmail, function(err, votes) {
			var newPost = [];
			for (var i = 0; i < posts.length; i++) {
				posts[i].hasVoted = 0;
				for (var j = 0; j < votes.length; j++) {
					if (posts[i].POST_ID === votes[j].POST_ID) {
						posts[i].hasVoted = 1;
					}
				}
				newPost[newPost.length] = posts[i];
			}
			callback(newPost);
		});
	}
}

function addUser(person, callback) {
	connection.query("INSERT INTO uni_users (USER_EMAIL, USER_NAME, USER_ALIAS, USER_DESCRIPTION, USER_KEYPIN, USER_EMAIL_FRAG, DONE_REG, VERIFIED_NUM) VALUES (?,?,?,?,?,?,?,?)",
					[ person.email, person.name, person.alias,person.description, person.keycode, person.emailFrag, 1, 1 ], function(err) {
						if (err) {
							callback(err);
						}
					});
}

function newPost(post) {
	connection
			.query(
					"INSERT INTO uni_posts (POST_USERNAME, POST_TEXT, POST_TIME, POST_EMAIL_FRAG, POST_IMG, POST_EMAIL, POST_USERID) VALUES (?,?,?,?,?,?,?)",
					[ post.POST_USERNAME, post.POST_TEXT, post.POST_TIME,
							post.emailFrag, "", post.email, post.POST_USERID ],
					function(err) {
						if (err) {
							console.log(err);
						}
					});
}

function authenticateUser(email, password, callback) {
	connection
			.query(
					"SELECT * FROM uni_users WHERE USER_EMAIL = (?) and USER_KEYPIN = (?)",
					[ email, password ], function(err, rows) {
						if (err) {
							console.error(err.stack);
							callback(err, null);
						} else {
							if (rows.length > 0) {
								callback(null, rows);
							}
							callback(null, null);
						}
					});
}

function confirmCode(email, keypin, callback) {
	connection
			.query(
					"SELECT * FROM uni_users WHERE USER_EMAIL = (?) AND USER_KEYPIN = (?)",
					[ email, keypin ], function(err, rows) {
						callback(rows);
					})
}

function checkEmail(email, callback) {
	connection.query("SELECT * FROM uni_users WHERE USER_EMAIL = (?)", [email], function(err, rows) {
		var userExists = true;
		if (err) {
			console.error(err.stack);
			callback(err, null);
		}else{
			if (rows.length === 0) {
				userExists = false;
				callback(null, userExists);
			}else{
				callback(null, userExists);
			}
		}
	});
}

function updateProfile(user) {
	connection
			.query(
					"UPDATE uni_users SET USER_NAME = (?), USER_ALIAS = (?), USER_DESCRIPTION = (?) WHERE USER_ID = (?)",
					[ user.name, user.alias, user.description, user.id ],
					function(err) {
						if (err) {
							console.log(err.stack);
						}
					});
}

function loadEvents(userEmail, emailFrag, callback) {
	connection.query("SELECT * FROM uni_events WHERE EVENT_EMAIL_FRAG = (?)", emailFrag, function(err, events) {
		if(events.length === 0){
			callback(events);
		}else{
			getJoinedUsers(events, function(updatedEvents){
				checkUserJoined(updatedEvents, userEmail, function(finalEvents){
					callback(finalEvents);
				});
			});
		}
	});
}

function getJoinedUsers(events, callback) {
	var sqlQuery = 'SELECT * FROM uni_votes_e WHERE EVENT_ID=' + events[0].EVENT_ID;
	for(var i = 1; i < events.length; i++){
		sqlQuery += ' OR EVENT_ID=' + events[i].EVENT_ID;
	}
	connection.query(sqlQuery, function(err, eventNumber) {
		var newEvent = [];
		for (var i = 0; i < events.length; i++) {
			events[i].numberJoinedUsers = 0;
			for (var j = 0; j < eventNumber.length; j++) {
				if (events[i].EVENT_ID === eventNumber[j].EVENT_ID) {
					events[i].numberJoinedUsers += 1;
				}
			}
			newEvent[newEvent.length] = events[i];
		}
		callback(newEvent);
	});
}

function checkUserJoined(posts, userEmail, callback) {
	connection.query('SELECT * FROM uni_votes_e WHERE USER_EMAIL = (?)', userEmail, function(err, events) {
		var newEvent = [];
		for (var i = 0; i < posts.length; i++) {
			posts[i].hasJoined = 0;
			for (var j = 0; j < events.length; j++) {
				if (posts[i].EVENT_ID === events[j].EVENT_ID) {
					posts[i].hasJoined = 1;
				}
			}
			newEvent[newEvent.length] = posts[i];
		}
		callback(newEvent);
	});
}

function createEvent(newEvent) {
	connection.query("INSERT INTO uni_events (USER_NAME, USER_ID, EVENT_NAME, EVENT_DESCR, EVENT_TIME, EVENT_EMAIL_FRAG) VALUES (?,?,?,?,?,?)",
			[newEvent.USER_NAME, newEvent.USER_ID, newEvent.EVENT_NAME, newEvent.EVENT_DESCR, newEvent.EVENT_TIME, newEvent.EVENT_EMAIL_FRAG ], function(err) {
		if (err) {
			console.log(err);
		}
	});
}

function loadComments(id, type, callback) {
	connection.query("SELECT * FROM uni_post_com WHERE POST_ID = (?) AND COM_TYPE = (?)", [id, type], function(err, data) {
		if (err) {
			console.log(err);
		}
		callback(data);
	});
}

function newComment(newComment) {
	connection.query("INSERT INTO uni_post_com (POST_ID, COM_USER, COM_TXT, COM_TIME, COM_TYPE) VALUES (?,?,?,?,?)",
					[ newComment.postId, newComment.COM_USER, newComment.COM_TXT, newComment.COM_TIME, newComment.type ], function(err) {
						if (err) {
							console.log(err);
						}
						
					});
}

function upvotePost(newVote) {
	connection.query(
			"INSERT INTO uni_votes_p (POST_ID, USER_EMAIL) VALUES (?,?)", [
					newVote.postId, newVote.email ], function(err) {
				if (err) {
					console.log(err);
				}
			});
}

function downVotePost(deleteVote) {
	connection.query("DELETE FROM uni_votes_p WHERE POST_ID = (?) AND USER_EMAIL = (?)", [deleteVote.postId, deleteVote.email], function(err) {
		if (err) {
			console.log(err);
		}
	});
}

function joinEvent(newJoin){
	connection.query("INSERT INTO uni_votes_e (USER_EMAIL, EVENT_ID) VALUES (?,?)", [newJoin.email, newJoin.eventId], function(err){
		if(err){
			console.log(err);
		}
	});
}

function leaveEvent(newLeave) {
	connection.query("DELETE FROM uni_votes_e WHERE EVENT_ID = (?) AND USER_EMAIL = (?)", [newLeave.eventId, newLeave.email], function(err) {
		if (err) {
			console.log(err);
		}
	});
}

function upvotePeople(newVote) {
	connection.query("INSERT INTO uni_votes (USER_EMAIL, USER_ID) VALUES (?,?)", [newVote.email, newVote.userId ], function(err) {
		if (err) {
			console.log(err);
		}
	});
}

function downvotePeople(newVote) {
	connection.query("DELETE FROM uni_votes WHERE USER_ID = (?) AND USER_EMAIL = (?)", [newVote.userId, newVote.email], function(err) {
		if (err) {
			console.log(err);
		}
	});
}

function getNumberComments(callback) {
	connection.query("SELECT * FROM uni_post_com", function(err, data) {
		callback(data);
	});
}

function getReports(callback){
	connection.query("SELECT * FROM uni_reports", function(err, rows){
		if(err){
			console.log(err);
		}
		callback(rows);
	});
}

function newReport(report){
	connection.query("INSERT INTO uni_reports (REPORTER_NAME, REPORTER_ID, REPORTEE_NAME, REPORTEE_ID, REPORT_TEXT) VALUES (?,?,?,?,?)",
			[report.reporterName, report.reporterId, report.reporteeName, report.reporteeId, report.reportText], function(err){
		if(err){
			console.log(err);
		}
	});
}

function deleteUser(userId){
	connection.query("DELETE FROM uni_users WHERE USER_ID = (?)", [userId], function(err){
		if(err){
			console.log(err);
		}
	});
}

function deleteUserPosts(userId){
	connection.query("DELETE FROM uni_posts WHERE POST_USERID = (?)", [userId], function(err){
		if(err){
			console.log(err);
		}
	});
}
function deleteUserComments(userId){
	connection.query("DELETE FROM uni_post_com WHERE USER_ID = (?)", [userId], function(err){
		if(err){
			console.log(err);
		}
	});
}
function deleteUserEvents(userId){
	connection.query("DELETE FROM uni_events WHERE USER_ID = (?)", [userId], function(err){
		if(err){
			console.log(err);
		}
	});
}

function deleteReport(reportId){
	connection.query("DELETE FROM uni_reports WHERE REPORT_ID = (?)", [reportId], function(err){
		if(err){
			console.log(err);
		}
	});
}

function deleteReports(userId){
	connection.query("DELETE FROM uni_reports WHERE REPORTEE_ID = (?)", [userId], function(err){
		if(err){
			console.log(err);
		}
	});
}

exports.dbConnect = dbConnect;
// exports.testDbConnect = testDbConnect;
exports.getProfiles = getProfiles;
exports.getPosts = getPosts;
exports.addUser = addUser;
exports.newPost = newPost;
exports.loadProfile = loadProfile;
exports.loadProfileEmail = loadProfileEmail;
exports.authenticateUser = authenticateUser;
exports.confirmCode = confirmCode;
exports.checkEmail = checkEmail;
exports.updateProfile = updateProfile;
exports.loadEvents = loadEvents;
exports.loadComments = loadComments;
exports.createEvent = createEvent;
exports.newComment = newComment;
exports.upvotePost = upvotePost;
exports.getNumberComments = getNumberComments;
exports.downVotePost = downVotePost;
exports.joinEvent = joinEvent;
exports.leaveEvent = leaveEvent;
exports.upvotePeople = upvotePeople;
exports.downvotePeople = downvotePeople;
exports.getReports = getReports;
exports.newReport = newReport;
exports.deleteUser = deleteUser;
exports.deleteUserPosts = deleteUserPosts;
exports.deleteUserComments = deleteUserComments;
exports.deleteUserEvents = deleteUserEvents;
exports.deleteReport = deleteReport;
exports.deleteReports = deleteReports;