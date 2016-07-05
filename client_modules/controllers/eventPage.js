var eventApp = angular.module('indexApp');

eventApp.controller('EventCtrl', function($scope, $http, $window, $location, authenticationSvc){
	var userInfo = authenticationSvc.getUserInfo();
	$scope.showComment = [];
	$scope.events = [];
	$scope.joinStatus = [];
	var eventTime;
	var date = new Date();
	var currentTime = date.getTime();
	var loadEvent = {
		token: userInfo.accessToken,
		emailFrag: userInfo.emailFrag
	};
	$http.post("/loadEvents", loadEvent).success(function(data){
		for(var i = 0; i < data.length; i++){
			var difference = data[i].EVENT_TIME - currentTime;
			var seconds = Math.floor(difference / 1000);
	        var minutes = Math.floor(seconds / 60);
	        var hours = Math.floor(minutes / 60);
	        var days = Math.floor(hours / 24);
	        if (hours < 1 && minutes < 1) {
	            if (seconds < 0){
	            	seconds = 0;
	            	eventTime = seconds + " Seconds";
	            }
	            if(seconds === 1){
	            	eventTime = seconds = " Second"
	            }else{
		            eventTime = seconds + " Seconds";
	            }
	        } else if (hours < 1) {
	        	if(minutes === 1){
	        		eventTime = minutes + " Minute";
	        	}else{
		        	eventTime = minutes + " Minutes";
	        	}
	        } else if (hours < 24) {
	        	if(hours === 1){
	        		eventTime = hours + " Hour";
	        	}else{
		        	eventTime = hours + " Hours";
	        	}
	        } else if (days < 365) {
	        	console.log(days);
	        	if(days === 1){
	        		eventTime = days + " Day";
	        	}else{
	        		eventTime = days + " Days";
	        	}
	        } else {
	        	eventTime = 1 + " Year";
	        }
	        if(data[i].EVENT_TIME > currentTime - 3600000){
	        	data[i].EVENT_TIME = eventTime;
				if(data[i].hasJoined === 1){
					data[i].joined = true;
					data[i].peopleIconColor = "yellow";
				}else{
					data[i].joined = false;
					data[i].peopleIconColor = "gray";
				}
				$scope.events.push(data[i]);
	        }
		}
		$("#search-field").change();
	});
	
	$scope.showComments = function(index, eventId){
		for(var i = 0; i < $scope.events.length; i++){
			$scope.showComment[i] = false;
		}
		$scope.comments = [];
		$scope.showComment[index] = true;
		var commentLoader = {
			postID: eventId,
			type: "Event"
		};
		$http.post('/loadComments', commentLoader)
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
 				data[i].COM_TIME = commentTime;
 				data[i].time = data[i].COM_TIME;
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
	
	$scope.postComment = function(index){
		var newComment = {
			postId: $scope.events[index].EVENT_ID,
			userName: userInfo.name,
			message: document.getElementById('commentBox').value,
			type: "Event"
		};
		$http.post('/newComment', newComment).success(function (data) {
			data.comment.COM_TIME = "0s";
			$scope.comments.unshift(data.comment);
			$("#commentForm")[0].reset();
		})
		.error(function (error) {
			alert(error);
		});
	}
	
  	$scope.joinEvent = function(index, event){
  		event.joined = true;
  		var joinEvent = {
  			eventId: event.EVENT_ID,
  			token: userInfo.accessToken
  		}
  		$http.post("/joinEvent", joinEvent).success(function (data){
  			event.peopleIconColor = "yellow";
  			event.numberJoinedUsers += 1;
  		})
  		.error(function (error){
  			alert(error);
  		});
  	}
  	
  	$scope.leaveEvent = function(index, event){
  		event.joined = false;
  		var joinEvent = {
  	  			eventId: event.EVENT_ID,
  	  			token: userInfo.accessToken
  	  	}
  		$http.post("/leaveEvent", joinEvent).success(function (data){
  			event.peopleIconColor = "gray";
  			event.numberJoinedUsers -= 1;
  		})
  		.error(function (error){
  			alert(error);
  		});
  	}
  	
	$scope.showModal = false;
	$scope.open = function($event) {
		$scope.showModal = !$scope.showModal;
		$scope.createEvent = function(){
			var date = new Date();
			var currentTime = date.getTime();
			var date = document.getElementById('date');
			var time = document.getElementById('time');
			var dateMill = Date.parse(date.value + "T" + time.value);
			var newEvent = {
				userId: userInfo.id,
				userName: userInfo.name,
				eventName: document.getElementById('eventName').value,
				description: document.getElementById('description').value,
				emailFrag: userInfo.emailFrag,
				time: dateMill
			};
			$http
	 		.post('/newEvent', newEvent)
	 		.success(function (data) {
	 			var difference = data.EVENT_TIME - currentTime;
				var seconds = Math.floor(difference / 1000);
		        var minutes = Math.floor(seconds / 60);
		        var hours = Math.floor(minutes / 60);
		        var days = Math.floor(hours / 24);
		        if (hours < 1 && minutes < 1) {
		            if (seconds < 0){
		            	seconds = 0;
		            	eventTime = seconds + " Seconds";
		            }
		            if(seconds === 1){
		            	eventTime = seconds = " Second"
		            }else{
			            eventTime = seconds + " Seconds";
		            }
		        } else if (hours < 1) {
		        	if(minutes === 1){
		        		eventTime = minutes + " Minute";
		        	}else{
			        	eventTime = minutes + " Minutes";
		        	}
		        } else if (hours < 24) {
		        	if(hours === 1){
		        		eventTime = hours + " Hour";
		        	}else{
			        	eventTime = hours + " Hours";
		        	}
		        } else if (days < 365) {
		        	console.log(days);
		        	if(days === 1){
		        		eventTime = days + " Day";
		        	}else{
		        		eventTime = days + " Days";
		        	}
		        } else {
		        	eventTime = 1 + " Year";
		        }
	 			data.event.numberJoinedUsers = 0;
	 			data.event.EVENT_TIME = eventTime;
	 			$scope.events.unshift(data.event);
	 			$scope.showModal = false;
	 		})
	 		.error(function (error) {
	 			alert(error);
	 		});
		}
	}
	$scope.reportEvent = function(index, event){
		if (confirm("Report This Event?") == true) {
			var report = {
					reporterName: userInfo.name,
					reporterId: userInfo.id,
					reporteeName: event.USER_NAME,
					reporteeId: event.USER_ID,
					reportText: event.EVENT_DESCR
			}
			$http.post('/newReport', report).success(function (result){
				alert("Event Reported");
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

eventApp.filter('searchForEvent', function(){
	return function(arr, searchString){
		if(!searchString){
			return arr;
		}
		var result = [];
		searchString = searchString.toLowerCase();
		angular.forEach(arr, function(item){
			if(item.EVENT_NAME.toLowerCase().indexOf(searchString) !== -1){
				result.push(item);
			}
		});
		return result;
	};
});

eventApp.directive('eventModal', function () {
    return {
        template: '<div class="modal fade">' + 
            '<div class="modal-dialog">' + 
              '<div class="modal-content">' + 
                '<div class="modal-header">' + 
                  '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                  '<h4 class="modal-title">{{ title }}</h4>' + 
                '</div>' + 
                '<div class="modal-body" ng-transclude></div>' + 
              '</div>' + 
            '</div>' + 
          '</div>',
        restrict: 'E',
        transclude: true,
        replace:true,
        scope:true,
        link: function postLink(scope, element, attrs) {
          scope.title = attrs.title;

          scope.$watch(attrs.visible, function(value){
            if(value == true)
              $(element).modal('show');
            else
              $(element).modal('hide');
          });

          $(element).on('shown.bs.modal', function(){
            scope.$apply(function(){
              scope.$parent[attrs.visible] = true;
            });
          });

          $(element).on('hidden.bs.modal', function(){
            scope.$apply(function(){
              scope.$parent[attrs.visible] = false;
            });
          });
        }
      };
});


