var passwordApp = angular.module('indexApp');

passwordApp.controller('ForgotPasswordCtrl', function($scope, $http, $window, $location){
	var email = document.getElementById('USER_EMAIL');
	$scope.sendEmail = function() {
		$http.post('/sendPassword', { email: email.value }).success(function(data){
			$window.alert("Email Sent");
			$location.path("/");
		})
		.error(function(error){
			$window.alert(error);
		});
	};	
});
