var noticeApp = angular.module('indexApp');

noticeApp.controller('MainCtrl', function($scope, $http, $window, jwtHelper, authenticationSvc){
	var userInfo = authenticationSvc.getUserInfo();
	var postTime;
	var postImage;
	var date = new Date();
	var currentTime = date.getTime();
	$scope.showComment = [];
	$scope.posts = [];
	$scope.vote = [];
	$http.post("/loadPosts", {
		emailFrag: userInfo.emailFrag,
		token: userInfo.accessToken
	})
	.success(function(postData){
		for(var i = 0; i < postData.length; i++){
			var seconds = Math.floor((currentTime - postData[i].POST_TIME) / 1000);
	        var minutes = Math.floor(seconds / 60);
	        var hours = Math.floor(minutes / 60);
	        var days = Math.floor(hours / 24);
	        if (hours < 1 && minutes < 1) {
	            if (seconds < 0){
	            	seconds = 0;
		            postTime = seconds + "s";
	            }
	        } else if (hours < 1) {
	            postTime = minutes + "m";
	        } else if (hours < 24) {
	            postTime = hours + "h";
	        } else if (days < 365) {
	            postTime = days + "d";
	        } else {
	            postTime = 1 + "y";
	        }
			postData[i].POST_TIME = postTime;
			postData[i].POST_IMAGE = "http://www46@wlc1www46.webland.ch/unisphere/php/images/profile_images/profile_image_" + postData[i].POST_USERID + ".png";
			if(postData[i].POST_IMAGE === "http://www46@wlc1www46.webland.ch/unisphere/php/images/profile_images/profile_image_0.png"){
				postData[i].POST_IMAGE = "/images/765-default-avatar.png";
			}
			var postEmail = postData[i].POST_EMAIL;
			if(postData[i].hasVoted === 1){
				postData[i].voted = true;
				postData[i].voteIconColor = "yellow";
			}else{
				postData[i].voted = false;
				postData[i].voteIconColor = "gray";
			}
			$scope.posts.push(postData[i]);
		}
		$("#search-field").change();
	})
	.error(function (error){
		console.log(error);
	});
	
	$scope.submitPost = function(){
		var postBox = document.getElementById("postBox");
		var newPost = {
			message: $scope.postMessage,
			token: userInfo.accessToken
		};
		$http
 		.post('/newPost', newPost)
 		.success(function (data) {
			data.post.POST_TIME = "0s";
			data.post.POST_IMAGE = "http://www46@wlc1www46.webland.ch/unisphere/php/images/profile_images/profile_image_" + data.post.POST_USERID + ".png";
			data.post.voted = false;
			data.post.voteIconColor = "gray";
			data.post.numberVotes = 0;
			data.post.numberComments = 0;
 			$scope.posts.unshift(data.post);
 			$("#postForm")[0].reset();
 		})
 		.error(function (error) {
 			console.log(error);
 		});
  	};
  	
  	$scope.upvotePost = function(index, post){
  		post.voted = true;
  		var newUpvote = {
  			postId: post.POST_ID,
  			token: userInfo.accessToken
  		}
  		$http.post("/upvotePost", newUpvote).success(function (data){
  			post.numberVotes += 1;
  			post.voteIconColor = "yellow";
  		})
  		.error(function (error){
  			alert(error);
  		});
  	}
  	
  	$scope.downvotePost = function(index, post){
  		post.voted = false;
  		var newUpvote = {
  			postId: post.POST_ID,
  			token: userInfo.accessToken
  		}
  		$http.post("/downVotePost", newUpvote).success(function (data){
  			post.numberVotes -= 1;
  			post.voteIconColor = "gray";
  		})
  		.error(function (error){
  			alert(error);
	  	});
  	}
  	
	$scope.showComments = function(index, postId){
		for(var i = 0; i < $scope.posts.length; i++){
			$scope.showComment[i] = false;
		}
		$scope.comments = [];
		$scope.showComment[index] = true;
		$http.post('/loadComments', {postID: postId, type: "Post"})
		.success(function (data) {
 			var commentTime;
 			for(var i = 0; i < data.length; i++){
 				var seconds = Math.floor((currentTime - data[i].COM_TIME) / 1000);
 		        var minutes = Math.floor(seconds / 60);
 		        var hours = Math.floor(minutes / 60);
 		        var days = Math.floor(hours / 24);
 		        if (hours < 1 && minutes < 1) {
 		            if (seconds < 0)
 		                seconds = 0;
 		            commentTime = seconds + "s";
 		        } else if (hours < 1) {
 		        	commentTime = minutes + "m";
 		        } else if (hours < 24) {
 		        	commentTime = hours + "h";
 		        } else if (days < 365) {
 		        	commentTime = days + "d";
 		        } else {
 		        	commentTime = 1 + "y";
 		        }
 		       data[i].time = data[i].COM_TIME;
 				data[i].COM_TIME = commentTime;
 				$scope.comments.push(data[i]);
 			}
 		})
 		.error(function (error) {
 			console.log(error);
 		});	
	}
	
	$scope.hideComments = function(index){
		$scope.showComment[index] = false;
	}

	$scope.postComment = function(index, post){
		var postBox = document.getElementById("commentBox");
		var newComment = {
			postId: post.POST_ID,
			userName: userInfo.name,
			message: document.getElementById('commentBox').value,
			type: "Post"
		};
		$http.post('/newComment', newComment).success(function (data) {
			data.comment.COM_TIME = "0s";
			post.numberComments += 1;
			$scope.comments.unshift(data.comment);
			$("#commentForm")[0].reset();
		})
		.error(function (error) {
			alert(error);
		});
	}
	$scope.flagPost = function(index, post){
		if (confirm("Report This Post?") == true) {
			var report = {
					reporterName: userInfo.name,
					reporterId: userInfo.id,
					reporteeName: post.POST_USERNAME,
					reporteeId: post.POST_USERID,
					reportText: post.POST_TEXT
			}
			$http.post('/newReport', report).success(function (result){
				alert("Post Reported");
			}).error(function(error){
				console.log(error);
			});
	    }
	}
	$scope.flagComment = function(index, comment){
		if (confirm("Report This Comment?") == true) {
			var report = {
					reporterName: userInfo.name,
					reporterId: userInfo.id,
					reporteeName: comment.COM_USER,
					reporteeId: comment.USER_ID,
					reportText: comment.COM_TXT
			}
			$http.post('/newReport', report).success(function (result){
				alert("Comment Reported");
			}).error(function(error){
				console.log(error);
			});
	    }
	}
});
noticeApp.filter('searchFor2', function(){
	return function(arr, searchString){
		if(!searchString){
			return arr;
		}
		var result = [];
		searchString = searchString.toLowerCase();
		angular.forEach(arr, function(item){
			if(item.POST_USERNAME.toLowerCase().indexOf(searchString) !== -1){
				result.push(item);
			}
		});
		return result;
	};
});
