var peopleApp = angular.module('indexApp');

peopleApp.controller('PeopleCtrl', function($scope, $http, $window, jwtHelper, authenticationSvc){
	var userInfo = authenticationSvc.getUserInfo();
	$scope.profiles = [];
	$scope.vote = [];
	var token = {
		token: userInfo.accessToken
	};
	$http.post("/loadProfiles", token).success(function(data){
		for(var i = 0; i < data.length; i++){
			if(data[i].USER_EMAIL_FRAG === userInfo.emailFrag){
				if(data[i].hasVoted === 1){
					data[i].voted = true;
					data[i].voteIconColor = "yellow";
				}else{
					data[i].voted = false;
					data[i].voteIconColor = "gray";
				}
				$scope.profiles.push(data[i]);
			}
		}
		$("#search-field").change();
	});
	
	$scope.upvotePeople = function(index, profile){
  		profile.voted = true;
  		var newUpvote = {
  			userId: profile.USER_ID,
  			token: userInfo.accessToken
  		}
  		$http.post("/upvotePeople", newUpvote).success(function (data){
  			profile.voteIconColor = "yellow";
  		})
  		.error(function (error){
  			alert(error);
  		});
  	}
  	
  	$scope.downvotePeople = function(index, profile){
  		var newUpvote = {
  			userId: profile.USER_ID,
  			token: userInfo.accessToken
  		}
  		profile.voted = false;
  		$http.post("/downVotePeople", newUpvote).success(function (data){
  			profile.voteIconColor = "gray";
  		})
  		.error(function (error){
  			alert(error);
	  	});
  	}
  	
  	$scope.reportPerson = function(index, profile){
  		if (confirm("Report This User?") == true) {
  			var reason = prompt("Why Are You Reporting This User?", "");
			var report = {
					reporterName: userInfo.name,
					reporterId: userInfo.id,
					reporteeName: profile.USER_NAME,
					reporteeId: profile.USER_ID,
					reportText: reason
			}
			$http.post('/newReport', report).success(function (result){
				alert("User Reported");
			}).error(function(error){
				console.log(error);
			});
	    }
  	}
});

peopleApp.filter('searchFor', function(){
	return function(arr, searchString){
		if(!searchString){
			return arr;
		}
		var result = [];
		searchString = searchString.toLowerCase();
		angular.forEach(arr, function(item){
			if(item.USER_NAME.toLowerCase().indexOf(searchString) !== -1){
				result.push(item);
			}
		});
		return result;
	};
});


