var app = angular.module('indexApp', [
	'ngRoute', 
	'ngAnimate', 
	'infinite-scroll', 
	'ui.router', 
	'angular-jwt',
	'ui.bootstrap',
	'angularFileUpload'
]);
app.config(function($stateProvider, $locationProvider, $httpProvider, $urlRouterProvider){
      $stateProvider
          .state('notice',{
        	  url: "/notice",
        	  templateUrl: '/html/noticeBoard.html',
        	  controller: 'MainCtrl',
        	  css: 'css/indexPage.css',
        	  resolve: {
        		  	auth: ["$q", "authenticationSvc", function($q, authenticationSvc) {
        		  		var userInfo = authenticationSvc.getUserInfo();
        		  		if(userInfo) {
        		  			return $q.when(userInfo);
        		  		}else{
        		  			return $q.reject({ authenticated: false });
        		  		}
        		    }]
        	  }
          })
          .state('people',{
        	  url: "/people",
              templateUrl: '/html/people.html',
              controller: 'PeopleCtrl',
              css: 'css/indexPage.css',
              resolve: {
      		  	auth: ["$q", "authenticationSvc", function($q, authenticationSvc) {
      		  		var userInfo = authenticationSvc.getUserInfo();
      		  		if(userInfo) {
      		  			return $q.when(userInfo);
      		  		}else{
      		  			return $q.reject({ authenticated: false });
      		  		}
      		    }]
              }
          })
          .state('profile',{
        	  url: "/profile",
              templateUrl: '/html/profile.html',
              controller: 'ProfileCtrl',
              css: 'css/indexPage.css',
              resolve: {
      		  	auth: ["$q", "authenticationSvc", function($q, authenticationSvc) {
      		  		var userInfo = authenticationSvc.getUserInfo();
      		  		if(userInfo) {
      		  			return $q.when(userInfo);
      		  		}else{
      		  			return $q.reject({ authenticated: false });
      		  		}
      		    }]
              }
          })
          .state('admin',{
        	  url: "/admin",
              templateUrl: '/html/admin.html',
              controller: 'AdminCtrl',
              css: 'css/indexPage.css',
              resolve: {
      		  	auth: ["$q", "authenticationSvc", function($q, authenticationSvc) {
      		  		var userInfo = authenticationSvc.getUserInfo();
      		  		if(userInfo) {
      		  			return $q.when(userInfo);
      		  		}else{
      		  			return $q.reject({ authenticated: false });
      		  		}
      		    }]
              }
          })
          .state('register',{
        	  url: "/register",
              templateUrl: '/html/registerForm.html',
              controller: 'RegisterCtrl',
          })
          .state('register.signup',{
        	  url: "/signup",
              templateUrl: '/html/registerSignup.html',
          })
          .state('register.confirm',{
        	  url: "/confirm",
              templateUrl: '/html/registerConfirm.html',
          })
          .state('logout', {
        	  url: "/logout",
        	  controller: 'LogoutCtrl',
        	  resolve: {
      		  	auth: ["$q", "authenticationSvc", function($q, authenticationSvc) {
      		  		var userInfo = authenticationSvc.getUserInfo();
      		  		if(userInfo) {
      		  			return $q.when(userInfo);
      		  		}else{
      		  			return $q.reject({ authenticated: false });
      		  		}
      		    }]
        	  }
          })
          .state('login',{
            	  url: "/",
                  templateUrl: '/html/welcome.html',
                  controller: 'LoginCtrl',
                  css: 'css/welcomePage.css'
          })
          .state('forgotPassword',{
            	  url: "/forgotPassword",
                  templateUrl: '/html/forgotPassword.html',
                  controller: 'ForgotPasswordCtrl'
          })
          .state('event',{
            	  url: "/event",
                  templateUrl: '/html/event.html',
                  controller: 'EventCtrl',
                  css: 'css/indexPage.css'
          });
     	$locationProvider.html5Mode(true);
});

app.controller('HeaderCtrl', function($scope, $window, $location, Header){
	$scope.Header = Header;
});

app.controller('LogoutCtrl', function($scope, $window, $location, authenticationSvc, Header){
	authenticationSvc.logout()
			.then(function (result) {
				Header.setBrand('Unisphere');
				$scope.userInfo = null;
				Header.setLogin('Login');
				Header.setLoginHref('/');
				Header.setNotice('');
				Header.setPeople('');
				Header.setProfile('');
				Header.setEvent('');
				Header.setAdmin('');
                $location.path("/");
            }, function (error) {
                console.log(error);
            });
});

app.controller('indexController', function($scope, $http, $modal, authenticationSvc, $window, $state){
	$scope.$watch(function(){
		return ($state.current && $state.current.css) ? $state.current.css : 'css/welcomePage.css';
	},
	function(value){
		$scope.css = value;
	});
	$scope.showProfile = false;
	$scope.openProfile = function(){
		var userInfo = JSON.parse($window.sessionStorage["userInfo"]);
		$http.post('/loadProfile', {
			id: userInfo.id
		})
		.success(function (data) {
			document.getElementById('profileName').value = data[0].USER_NAME;
			document.getElementById('profileAlias').value = data[0].USER_ALIAS;
			document.getElementById('profileDescription').value = data[0].USER_DESCRIPTION;
			$scope.USER_ID = data[0].USER_ID;
		})
		.error(function (error) {
			console.log(error);
		});
		$scope.showProfile = !$scope.showProfile;
	};
	$scope.update = function(){
		var userInfo = JSON.parse($window.sessionStorage["userInfo"]);
		var updatedUser = {
			id: userInfo.id,
			name: document.getElementById('profileName').value,
			alias: document.getElementById('profileAlias').value,
			description: document.getElementById('profileDescription').value
		};
		$http.post('/updateProfile', updatedUser).success(function (data) {
			alert("Updated");
			$scope.showProfile = false;
		})
		.error(function (error) {
			alert("Error Updating Profile. Please try again later");
			$scope.showProfile = false;
		});
	}
});

app.run(["$rootScope", "$location", function($rootScope, $location) {
	  $rootScope.$on("$routeChangeSuccess", function(userInfo) {
		  console.log(userInfo);
	  });
	  $rootScope.$on("$routeChangeError", function(event, current, previous, eventObj) {
		  if (eventObj.authenticated === false) {
			  $location.path("/login");
		  }
	  });
}]);

app.factory("authenticationSvc", function($http, $q, $window) {
	  	var userInfo;
	  	function login(email, password) {
		    var deferred = $q.defer();
		    $http.post("/authenticate", {
		    	email: email,
		    	password: password
		    }).then(function(result) {
		    	userInfo = {
		    		accessToken: result.data.token,
		    		id: result.data.id,
		    		emailFrag: result.data.emailFrag,
		    		name: result.data.name,
		    		accessLevel: result.data.accessLevel
		    	};
		    	$window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
		    	deferred.resolve(userInfo);
		    },function(error) {
		    	deferred.reject(error);
		    });
		    	return deferred.promise; 
		 }
	  	function logout() {
	  		var deferred = $q.defer();
	  		$http({
	  			method: "POST",
	  			url: "/logout",
	  			headers: {
	  				"access_token": userInfo.accessToken
	  			}
	  		}).then(function(result) {
	  			$window.sessionStorage["userInfo"] = null;
	  			userInfo = null;
	  			deferred.resolve(result);
	  		},function(error) {
	  			deferred.reject(error);
	  		});
	  		return deferred.promise;
	  	}
	  	
	  	function getUserInfo() {
		    return userInfo;
	  	}
	  
	  	function init() {
	  		if ($window.sessionStorage["userInfo"]) {
	  			userInfo = JSON.parse($window.sessionStorage["userInfo"]);
	  		}
	  	} 
	  	init();
	  	
	  	return {
    		login: login,
    		logout: logout,
            getUserInfo: getUserInfo
	  	};
});

app.factory('Header', function(){
	var login = 'Login';
	var brand = 'Unisphere';
	var loginHref = '/';
	var notice = '';
	var people = '';
	var profile = '';
	var event = '';
	var admin = '';
	return{
		brand: function() { return brand; },
		setBrand: function(newBrand) { brand = newBrand; },
		login: function() {return login; },
		setLogin: function(newLogin) { login = newLogin; },
		loginHref: function() {return loginHref; },
		setLoginHref: function(newLoginHref) { loginHref = newLoginHref; },
		notice: function() { return notice; },
		setNotice: function(newNotice) { notice = newNotice; },
		people: function() { return people; },
		setPeople: function(newPeople) { people = newPeople; },
		profile: function() { return profile; },
		setProfile: function(newProfile) { profile = newProfile; },
		event: function() { return event; },
		setEvent: function(newEvent) { event = newEvent; },
		admin: function() { return admin; },
		setAdmin: function(newAdmin) { admin = newAdmin; }
	};
});

app.service('imageService', function ($http, $q, $timeout) {
	  var NUM_LOBES = 3
	  var lanczos = lanczosGenerator(NUM_LOBES)
	 
	  // resize via lanczos-sinc convolution
	  this.resize = function (img, width, height) {
	    var self = { }
	 
	    self.type    = img.type;
	    self.quality = 1.0
	    self.resultD = $q.defer()
	 
	    self.canvas = document.createElement('canvas')
	 
	    self.ctx = getContext(self.canvas)
	    self.ctx.imageSmoothingEnabled       = true
	    self.ctx.mozImageSmoothingEnabled    = true
	    self.ctx.oImageSmoothingEnabled      = true
	    self.ctx.imageSmoothingEnabled       = true
	 
	    if (img.naturalWidth <= width || img.naturalHeight <= height) {
	      console.log("FAST resizing image", img.naturalWidth, img.naturalHeight, "=>", width, height)
	 
	      self.canvas.width  = width
	      self.canvas.height = height
	      self.ctx.drawImage(img, 0, 0, width, height)
	      resolveLanczos(self)
	    } else {
	      console.log("SLOW resizing image", img.naturalWidth, img.naturalHeight, "=>", width, height)
	 
	      self.canvas.width  = width
	      self.canvas.height = height
	      self.ctx.drawImage(img, 0, 0, self.canvas.width, self.canvas.height)
	 
	      self.img = img
	      self.src = self.ctx.getImageData(0, 0, self.canvas.width, self.canvas.height)
	      self.dest = {
	        width:  width,
	        height: height
	      }
	      self.dest.data = new Array(self.dest.width * self.dest.height * 4)
	 
	      self.ratio     = img.naturalWidth / width
	      self.rcpRatio  = 2 / self.ratio
	      self.range2    = Math.ceil(self.ratio * NUM_LOBES / 2)
	      self.cacheLanc = {}
	      self.center    = {}
	      self.icenter   = {}
	 
	      $timeout(function () { applyLanczosColumn(self, 0) })
	    }
	 
	    return self.resultD.promise
	  }
	 
	  function applyLanczosColumn (self, u) {
	    self.center.x  = (u + 0.5) * self.ratio
	    self.icenter.x = self.center.x | 0
	 
	    for (var v = 0; v < self.dest.height; v++) {
	      self.center.y  = (v + 0.5) * self.ratio
	      self.icenter.y = self.center.y | 0
	 
	      var a, r, g, b
	      a = r = g = b = 0
	 
	      var norm = 0
	      var idx
	 
	      for (var i = self.icenter.x - self.range2; i <= self.icenter.x + self.range2; i++) {
	        if (i < 0 || i >= self.src.width) continue
	        var fX = (1000 * Math.abs(i - self.center.x)) | 0
	        if (!self.cacheLanc[fX]) {
	          self.cacheLanc[fX] = {}
	        }
	 
	        for (var j = self.icenter.y - self.range2; j <= self.icenter.y + self.range2; j++) {
	          if (j < 0 || j >= self.src.height) continue
	 
	          var fY = (1000 * Math.abs(j - self.center.y)) | 0
	          if (self.cacheLanc[fX][fY] === undefined) {
	            self.cacheLanc[fX][fY] = lanczos(Math.sqrt(Math.pow(fX * self.rcpRatio, 2) + Math.pow(fY * self.rcpRatio, 2)) / 1000)
	          }
	 
	          var weight = self.cacheLanc[fX][fY]
	          if (weight > 0) {
	            idx = (j * self.src.width + i) * 4
	            norm += weight
	 
	            r += weight * self.src.data[idx + 0]
	            g += weight * self.src.data[idx + 1]
	            b += weight * self.src.data[idx + 2]
	            a += weight * self.src.data[idx + 3]
	          }
	        }
	      }
	 
	      idx = (v * self.dest.width + u) * 4
	      self.dest.data[idx + 0] = r / norm
	      self.dest.data[idx + 1] = g / norm
	      self.dest.data[idx + 2] = b / norm
	      self.dest.data[idx + 3] = a / norm
	    }
	 
	    if (++u < self.dest.width) {
	      if (u % 16 === 0) {
	        $timeout(function () { applyLanczosColumn(self, u) })
	      } else {
	        applyLanczosColumn(self, u)
	      }
	    } else {
	      $timeout(function () { finalizeLanczos(self) })
	    }
	  }
	 
	  function finalizeLanczos (self) {
	    self.canvas.width  = self.dest.width
	    self.canvas.height = self.dest.height
	    //self.ctx.drawImage(self.img, 0, 0, self.dest.width, self.dest.height)
	    self.src = self.ctx.getImageData(0, 0, self.dest.width, self.dest.height)
	    var idx
	    for (var i = 0; i < self.dest.width; i++) {
	      for (var j = 0; j < self.dest.height; j++) {
	        idx = (j * self.dest.width + i) * 4
	        self.src.data[idx + 0] = self.dest.data[idx + 0]
	        self.src.data[idx + 1] = self.dest.data[idx + 1]
	        self.src.data[idx + 2] = self.dest.data[idx + 2]
	        self.src.data[idx + 3] = self.dest.data[idx + 3]
	      }
	    }
	    self.ctx.putImageData(self.src, 0, 0)
	    resolveLanczos(self)
	  }
	 
	  function resolveLanczos (self) {
	    var result = new Image()
	 
	    result.onload = function () {
	      self.resultD.resolve(result)
	    }
	 
	    result.onerror = function (err) {
	      self.resultD.reject(err)
	    }
	 
	    result.src = self.canvas.toDataURL(self.type, self.quality)
	  }
	 
	  // resize by stepping down
	  this.resizeStep = function (img, width, height, quality) {
	    quality = quality || 1.0
	 
	    var resultD = $q.defer()
	    var canvas  = document.createElement( 'canvas' )
	    var context = getContext(canvas)
	    var type = img.type
	 
	    var cW = img.naturalWidth
	    var cH = img.naturalHeight
	 
	    var dst = new Image()
	    var tmp = null
	 
	    //resultD.resolve(img)
	    //return resultD.promise
	 
	    function stepDown () {
	      cW = Math.max(cW / 2, width) | 0
	      cH = Math.max(cH / 2, height) | 0
	 
	      canvas.width  = cW
	      canvas.height = cH
	 
	      context.drawImage(tmp || img, 0, 0, cW, cH)
	 
	      dst.src = canvas.toDataURL(type, quality)
	 
	      if (cW <= width || cH <= height) {
	        return resultD.resolve(dst)
	      }
	 
	      if (!tmp) {
	        tmp = new Image()
	        tmp.onload = stepDown
	      }
	 
	      tmp.src = dst.src
	    }
	 
	    if (cW <= width || cH <= height || cW / 2 < width || cH / 2 < height) {
	      canvas.width  = width
	      canvas.height = height
	      context.drawImage(img, 0, 0, width, height)
	      dst.src = canvas.toDataURL(type, quality)
	 
	      resultD.resolve(dst)
	    } else {
	      stepDown()
	    }
	 
	    return resultD.promise
	  }
	 
	  function getContext (canvas) {
	    var context = canvas.getContext('2d')
	 
	    context.imageSmoothingEnabled       = true
	    context.mozImageSmoothingEnabled    = true
	    context.oImageSmoothingEnabled      = true
	    context.imageSmoothingEnabled       = true
	 
	    return context
	  }
	 
	  // returns a function that calculates lanczos weight
	  function lanczosGenerator (lobes) {
	    var recLobes = 1.0 / lobes
	 
	    return function (x) {
	      if (x > lobes) return 0
	      x *= Math.PI
	      if (Math.abs(x) < 1e-16) return 1
	      var xx = x * recLobes
	      return Math.sin(x) * Math.sin(xx) / x / xx
	    }
	  }
	})
