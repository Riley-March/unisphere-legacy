var registerApp = angular.module('indexApp');

registerApp.controller('RegisterCtrl', function($scope, $http, $window, $state, $location, $upload){
	$scope.formData = {};
	var keypin;
	var photo;
	var canvas;
	var context;
	$scope.addUser = function(){	
		var file = document.getElementById('photo');
		var fileReader = new FileReader();
		fileReader.onload = function(fileLoadedEvent){
			photo = fileLoadedEvent.target.result;
			var newUser = {
					email: $scope.formData.email,
					name: $scope.formData.name,
					alias: $scope.formData.alias,
					description: $scope.formData.desc,
					keycode: $scope.formData.keycode,
					photo: photo
			};
	        $http
	 		.post('/addUser', newUser)
	 		.success(function (result) {
	 			console.log(result);
	 			keypin = result.keypin;
	 			$state.go("register.confirm");
	 		})
	 		.error(function (error) {
	 			alert(error);
	 		});
		}
		fileReader.readAsDataURL(file.files[0]);
	}
	$scope.confirmUser = function(){
		if(keypin != $scope.formData.keycode){
			alert("Keypin Incorrect");
		}else{
			$location.path("/");
		}
	}
	
});

registerApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

