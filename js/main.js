var myApp = angular.module("myApp", ['firebase']);
var base = "https://api.spotify.com";
var staticArtist;

var myCtrl = myApp.controller("myCtrl", function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject) {
	// firebase actions
	var ref = new Firebase("https://spotify-as-challenge.firebaseio.com/");
    var userRef = ref.child("users");
    var searchRef = ref.child("searches");
    var playlistRef = ref.child("playlists");

    $scope.users = $firebaseObject(userRef);
    $scope.searches = $firebaseArray(searchRef);
    $scope.playlists = $firebaseArray(playlistRef);

    $scope.authObj = $firebaseAuth(ref);

    var authData = $scope.authObj.$getAuth();
    if (authData) {
        $scope.userId = authData.uid;
        document.getElementById("account-action").innerHTML = "Logout";
    } 

    $scope.signUp = function() {
        // Create user
        $scope.authObj.$createUser({
            email: $scope.email,
            password: $scope.password,          
        })

        // Once the user is created, call the logIn function
        .then($scope.logIn)

        // Once logged in, set and save the user data
        .then(function(authData) {
            $scope.userId = authData.uid;
            $scope.users.$save()
            $scope.closeSignin();
            $scope.hideOverlay();
            document.getElementById("account-action").innerHTML = "Logout";
        })

        // Catch any errors
        .catch(function(error) {
            console.error("Error: ", error);
        });
    }

    // SignIn function
    $scope.signIn = function() {
        $scope.logIn().then(function(authData){
            $scope.userId = authData.uid;
            $scope.closeSignin();
            $scope.hideOverlay();
            document.getElementById("account-action").innerHTML = "Logout";
        })
    }

    // LogIn function
    $scope.logIn = function() {
        return $scope.authObj.$authWithPassword({
            email: $scope.email,
            password: $scope.password
        })
    }

    // LogOut function
    $scope.logOut = function() {
        $scope.authObj.$unauth()
        $scope.userId = false
        document.getElementById("account-action").innerHTML = "Sign In";
    }

    // Spotify actions
	$scope.maxSize = 10;
	$scope.reverseSort = true;
	$scope.artist;

    $scope.execute = function() {
    	$scope.finished = false;
    	$scope.saved = false;
    	staticArtist = $scope.artist;
    	if ($scope.userId) {
	    	$scope.searches.$add({
		        text:staticArtist,
		        userId: $scope.userId
			});
			$scope.searches.$save();
    	}
    	$scope.myArtists;
    	// playlist of every track from every related artist
		$scope.completePlaylist = [];
		// playlist of random tracks from random related artists
		$scope.randomizePlaylist = [];
    	// get artists from user input
        $http.get(base + "/v1/search?type=artist&query=" + $scope.artist).success(function(response) {
            $scope.myArtists = response.artists.items;
            if ($scope.myArtists.length != 0) {
            	$scope.changeInput($scope.myArtists[0].name);
	        	// get related artists from the 
	            $http.get(base + "/v1/artists/" + $scope.myArtists[0].id + "/related-artists").success(function(response) {
	    			$scope.relatedArtists = response.artists;
	    			var times = 0;
	    			if ($scope.relatedArtists.length != 0) {
		    			$scope.relatedArtists.forEach(function(item, index) {
		    				// get top tracks from each related artist
							$http.get(base + "/v1/artists/" + item.id + "/top-tracks?country=US").success(function(response) {
								response.tracks.forEach(function(track, index2) {
									$scope.completePlaylist.push(track);
									// check to see if playlist is done being added to
									if (index == $scope.relatedArtists.length -1 && index2 == response.tracks.length - 1 ) {
										$scope.randomize($scope.completePlaylist);
									}
								});
							});
						})	
	    			} else {
	    				$scope.finished = true;
	    			}
	    			
	    		});   
            } else {
            	$scope.finished = true;
            }
        });
    }

    $scope.randomize = function() {
    	var times = 0;
    	$scope.randomizePlaylist = [];
    	// run until maxSize is reached or every item is seen
    	while (times < $scope.completePlaylist.length && $scope.randomizePlaylist.length < $scope.maxSize) {
    		var randomNum = Math.floor((Math.random() * $scope.completePlaylist.length));
    		if ($scope.randomizePlaylist.indexOf($scope.completePlaylist[randomNum]) == -1) {
    			$scope.randomizePlaylist.push($scope.completePlaylist[randomNum]);
    			times++;
    		}
    	}
    	$scope.finished = true;
    }

  	$scope.changeInput = function(item) {
  		$scope.artist = item;
  	}

  	$scope.hideOverlay = function() {
  		document.getElementById("overlay").style.display = 'none';
  		document.getElementById("signin").style.display = 'none';
  		$scope.email = "";
  		$scope.password = "";
  	}

  	// Button functions
  	$scope.openLogin = function() {
  		if (document.getElementById("account-action").innerHTML == "Logout") {
  			$scope.logOut();
  		} else {
  			document.getElementById("signin").style.display = 'block';
	  		document.getElementById("selection").style.display = 'block';
	  		document.getElementById("login").style.display = 'none';
	  		document.getElementById("register").style.display = 'none';
	  		document.getElementById("signup-title").innerHTML = "Login";
	  		document.getElementById("overlay").style.display = 'block';
	  		$scope.email = "";
	  		$scope.password = "";
  		}
  		
  	}

  	$scope.loginSelect = function() {
  		document.getElementById("selection").style.display = 'none';
  		document.getElementById("login").style.display = 'block';
  		document.getElementById("signup-title").innerHTML = "Login";
  	}

  	$scope.registerSelect = function() {
  		document.getElementById("selection").style.display = 'none';
  		document.getElementById("register").style.display = 'block';
  		document.getElementById("signup-title").innerHTML = "Register";
  	}

  	$scope.backSelect = function() {
  		document.getElementById("selection").style.display = 'block';
  		document.getElementById("login").style.display = 'none';
  		document.getElementById("register").style.display = 'none';
  		document.getElementById("signup-title").innerHTML = "Login";
  		$scope.email = "";
  		$scope.password = "";
  	}

  	$scope.closeSignin = function() {
  		document.getElementById("overlay").style.display = 'none';
  		document.getElementById("signin").style.display = 'none';
  		$scope.email = "";
  		$scope.password = "";
  	}

  	// Action functions
  	$scope.saveList = function() {
  		var savedList = $scope.randomizePlaylist;
  		$scope.playlists.$add({
  			userId: $scope.userId,
  			content: savedList,
  			artist: staticArtist
  		})
  		$scope.playlists.$save();
  		$scope.saved = true;
  	}

  	$scope.deletePlaylist = function(deleteItem) {
  		$scope.playlists.$remove(deleteItem);
  		$scope.playlists.$save();
  	}

});

