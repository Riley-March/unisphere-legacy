var profileApp = angular.module('indexApp');

profileApp.controller('ProfileCtrl', function($scope, $http, $window, $modal, jwtHelper, authenticationSvc){
	var userInfo = authenticationSvc.getUserInfo();
	$http.post('/loadProfile', {
			id: userInfo.id
		})
		.success(function (data, status, headers, config) {
			$scope.USER_NAME = data[0].USER_NAME;
			$scope.USER_ALIAS = data[0].USER_ALIAS;
			$scope.USER_DESCRIPTION = data[0].USER_DESCRIPTION;
			$scope.USER_ID = data[0].USER_ID;
		})
		.error(function (data, status, headers, config) {
			alert("Could Not Load Profile");
			window.location = "/";
		});
	
	$scope.showModal = false;
	$scope.open = function(){
		$scope.showModal = !$scope.showModal;
		document.getElementById('name').value = $scope.USER_NAME;
		document.getElementById('alias').value = $scope.USER_ALIAS;
		document.getElementById('description').value = $scope.USER_DESCRIPTION;
	};
	$scope.update = function(){
		var updatedUser = {
			id: userInfo.id,
			name: document.getElementById('name').value,
			alias: document.getElementById('alias').value,
			description: document.getElementById('description').value
		};
		$http.post('/updateProfile', updatedUser).success(function (data, status, headers, config) {
			console.log("success");
			$scope.showModal = false;
			$http.post('/loadProfile', {
				id: userInfo.id
			})
			.success(function (data, status, headers, config) {
				$scope.USER_NAME = data[0].USER_NAME;
				$scope.USER_ALIAS = data[0].USER_ALIAS;
				$scope.USER_DESCRIPTION = data[0].USER_DESCRIPTION;
				$scope.USER_ID = data[0].USER_ID;
			})
			.error(function (data, status, headers, config) {
				alert("Could Not Load Profile");
				window.location = "/";
			});
		})
		.error(function (error) {
			alert("Error Updating Profile. Please try again later");
			window.location = "/profile";
		});
	}
});

profileApp.directive('modal', function () {
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

