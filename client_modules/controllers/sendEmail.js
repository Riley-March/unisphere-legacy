var emailApp = angular.module('indexApp');

emailApp.controller('EmailCtrl', function($scope, $http, $window, $location, authenticationSvc){
	alert("Send Email Page");
	$http.post('/sendPassword', userData).success(function(result){
		console.log(result);
	}).error(function(err){
		console.log(err);
	});
});
