var adminApp = angular.module('indexApp');

adminApp.controller('AdminCtrl', function($scope, $http, $window, $location, authenticationSvc){
	var userInfo = authenticationSvc.getUserInfo();
	$scope.reports = [];
	if(userInfo.accessLevel === "admin"){
		$http.get('/getReports').success(function (data){
			for(var i = 0; i < data.length; i++){
				$scope.reports.push(data[i]);
			}
		})
		.error(function (error){
			console.log(error);
		});
	}
	$scope.ignoreReport = function(index){
		if (confirm("Ignore This Report?") == true) {
			var user = {
					reportId: $scope.reports[index].REPORT_ID
				};
			$http.post('/deleteReport', user).success(function (result){
				alert("Report Removed");
				$scope.reports.splice(index, 1);
			}).error(function(error){
				console.log(error);
			});
	    }
	}
	$scope.deleteUser = function(index){
		if (confirm("Delete This User?") == true) {
			var user = {
				userId: $scope.reports[index].REPORTEE_ID
			};
			$http.post('/deleteUser', user).success(function (result){
				alert("User Deleted");
				for(var i = 0; i < $scope.reports.length; i++){
					if($scope.reports[index].REPORTEE_ID === user.userId){
						$scope.reports.splice(i, 1);
					}
				}
			}).error(function(error){
				console.log(error);
			});
	    }
	}
});




