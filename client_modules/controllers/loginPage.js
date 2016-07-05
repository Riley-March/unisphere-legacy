var loginApp = angular.module('indexApp');

loginApp.controller('LoginCtrl', function($scope, $http, $window, $location, authenticationSvc, Header, $modal, imageService){	
	$scope.showModal = false;
	$scope.registerModal = false;
	$scope.passwordModal = false;
	$scope.login = function(){
		$scope.showModal = !$scope.showModal;
		$scope.userInfo = null;
		document.getElementById("USER_PASSWORD").maxLength = "4";
		$scope.submit = function () {
			var email = document.getElementById('USER_EMAIL');
			var password = document.getElementById('USER_PASSWORD');
			authenticationSvc.login(email.value, password.value)
			.then(function(result){
				$scope.userInfo = result;
				Header.setBrand(result.emailFrag);
				Header.setLogin('Logout');
				Header.setLoginHref('/logout');
				Header.setNotice('Notice Board');
				Header.setPeople('People');
				Header.setProfile('Profile');
				Header.setEvent('Events');
				if(result.accessLevel === "admin"){
					Header.setAdmin('Admin');
				}
				$scope.showModal = false;
				$location.path("/notice");
				
			}, function(error){
				$window.alert("Invalid Credentials");
				console.log(error);
			});
		};	
	};
	$scope.register = function(){
		$scope.registerModal = !$scope.registerModal;
		$scope.submitRegister = function(){
			var image = new Image();
			var file = document.getElementById('photo');
			var email = document.getElementById('email');
			var name = document.getElementById('name');
			var alias = document.getElementById('alias');
			var description = document.getElementById('description');
			var fileReader = new FileReader();
			fileReader.readAsDataURL(file.files[0]);
			fileReader.onload = function(fileLoadedEvent){
				photo = fileLoadedEvent.target.result;
				image.src = photo;
				image.type = file.files[0].type;
				imageService.resize(image, 500, 500).then(function(resizedImage){
					var newUser = {
							email: email.value,
							name: name.value,
							alias: alias.value,
							description: description.value,
							photo: resizedImage.src
					};
			        $http
			 		.post('/addUser', newUser)
			 		.success(function (result) {
			 			keypin = result.keypin;
			 			$scope.registerModal = false;
			 			$scope.confirmModal = !$scope.confirmModal;
			 			$scope.checkKeycode = function(){
			 				enteredKeycode = document.getElementById('keycode');
				 			if(keypin != enteredKeycode.value){
				 				alert("Keypin Incorrect");
				 			}else{
				 				$scope.confirmModal = false;
				 			}
			 			}
			 		})
			 		.error(function (error) {
			 			alert(error);
			 		});
				});
			}		
		}
	}
	$scope.forgotPassword = function(){
		$scope.showModal = false;
		$scope.passwordModal = !$scope.passwordModal;
		var email = document.getElementById('emailAddress');
		$scope.sendPassword = function(){
			var passwordRequest = {
				email: email.value
			};
			console.log(passwordRequest);
			$http.post('/sendPassword', passwordRequest).success(function(result){
				alert('Password Sent!');
				$scope.passwordModal = false;
				$scope.showModal = !$scope.showModal;
			}).error(function(err){
				console.log(err);
			});
		}
	}
});

