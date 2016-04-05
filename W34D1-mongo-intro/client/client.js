angular.module('app', ['ngMaterial'])

.component('main', {
	templateUrl: 'main.html',
	controller: MainCtrl,
	bindings: {
	}
});

function MainCtrl($http) {
	this.$http = $http;
	this.greeting = 'VHS Store';
	this.movies = [];
	this.searchText = '';
}

MainCtrl.prototype.sayHi = function() {
	console.log(this.greeting);
}

/**
 * Used for both checking out a movie and checking in.
 * The server will need to check the "checkedOut" property of the movie.
 */
MainCtrl.prototype.checkOut = function(movie) {
	console.log('checkout', movie);
	var name = movie.name;
	var year = movie.year;
	this.$http.get(`/api/checkout?name=${name}&year=${year}`).then(response => {
		console.log('checked out movie');
		this.search(this.searchText);
	}).catch(error => {
		console.log('movie already checked out');
		this.search(this.searchText);
	});
}

MainCtrl.prototype.removeMovie = function(movie) {
	console.log('remove', movie);
	var name = movie.name;
	var year = movie.year;
	this.$http.get(`/api/removemovie?name=${name}&year=${year}`).then(response => {
		console.log('movie removed', response);
		this.search(this.searchText);
	});
}

MainCtrl.prototype.search = function(text) {
	if (text === undefined || text === '') {
		console.log('list all movies');
		this.$http.get('/api/movies').then(response => {
			console.log('api movies', response.data);
			this.movies = response.data;
		});
	} else {
		console.log('search for movies:', text);
		this.$http.get(`/api/searchmovie?name=${text}`).then(response => {
			this.movies = response.data;
		});
	}
}

MainCtrl.prototype.saveMovie = function(title, year) {
	console.log('save movie', title, year);

	this.$http.post('/api/addmovie', {
		title: title,
		year: year
	}).then(response => {
		console.log('saved movie', response);
		this.search('');
	});
}
