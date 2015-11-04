var myApp = angular.module("myApp", []);
var base = "https://api.spotify.com";

var myCtrl = myApp.controller("myCtrl", function($scope, $http) {
	$scope.maxSize = 10;
	$scope.reverseSort = true;
	$scope.audioObject = {};
	$scope.currentlyPlaying;
	$scope.artist;

    $scope.execute = function() {
    	$scope.myArtists;
    	// playlist of every track from every related artist
		$scope.completePlaylist = [];
		// playlist of random tracks from random related artists
		$scope.randomizePlaylist = [];
    	// get artists from user input
        $http.get(base + "/v1/search?type=artist&query=" + $scope.artist).success(function(response) {
            $scope.myArtists = response.artists.items;
            $scope.changeInput($scope.myArtists[0].name);
        	// get related artists from the 
            $http.get(base + "/v1/artists/" + $scope.myArtists[0].id + "/related-artists").success(function(response) {
    			$scope.relatedArtists = response.artists;
    			var times = 0;
    			$scope.relatedArtists.forEach(function(item) {
    				// get top tracks from each related artist
					$http.get(base + "/v1/artists/" + item.id + "/top-tracks?country=US").success(function(response) {
						response.tracks.forEach(function(track) {
							$scope.completePlaylist.push(track);
							times++;
							// check if the completePlaylist is done being filled
							if (times == $scope.relatedArtists.length * response.tracks.length) {
								$scope.randomize($scope.completePlaylist);
							}
						});
					});
				});
    		});   
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
    }

    // play code from https://github.com/mkfreeman/spotify-template/blob/master/app.js
    $scope.play = function(track) {
    	song = track.preview_url;
	    if($scope.currentSong == song) {
	      $scope.audioObject.pause()
	      $scope.currentlyPlaying = null;
	      $scope.currentSong = false
	      return
	    }
	    else {
	      if($scope.audioObject.pause != undefined) {
	      	$scope.audioObject.pause();
	      	$scope.currentlyPlaying = null;
	      }
	      $scope.audioObject = new Audio(song);
	      $scope.audioObject.play()  
	      $scope.currentlyPlaying = track.name + " by " + track.artists[0].name;
	      $scope.currentSong = song
	    }
  	}

  	$scope.changeInput = function(item) {
  		$scope.artist = item;
  		document.getElementsByName("search").value = item;
  	}

});

