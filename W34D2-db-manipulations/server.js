var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/vhs';
var movies;

var updateMovies = function() {
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection('movies');

        collection.find({}).toArray(function(err, docs) {
            assert.equal(err, null);
            movies = docs;
            db.close();
        });

    });
};

updateMovies();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/client'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

// fs.readFile("movies.json", 'utf8', (err, data) => {
//     if (err) throw err;
//     movies = JSON.parse(data);
// });

// List all movies.
app.get('/api/movies', function (req, res) {
    updateMovies();
    console.log("movies searched.");
    res.send(movies);
    
});

// Search and list matches on movie titles.
app.get('/api/searchmovie', function(req, res) {
    updateMovies();
    var returnmovies = [];
    var patt = new RegExp(req.query.name, 'gi');

    for (var i = 0; i < movies.length; i++) {
        if (patt.test(movies[i].name)) {
            console.log("Found One.");
            returnmovies.push(movies[i]);
        }
    }
    res.send(returnmovies);
});

// Add a movie.
app.post('/api/addmovie', function(req, res) {
    var newmovie = {
        "name": req.body.title,
        "year": req.body.year,
        "checkedout": false
    };
    movies.push(newmovie);
    console.log(newmovie);

    MongoClient.connect(url, function(err, db) {
        var collection = db.collection('movies');

        collection.insertOne(newmovie, function(err, r) {
            assert.equal(err, null);
            console.log("Inserted 1 document in the collection.");
            res.send("success");
            db.close();
        });
    });
});

// Remove a movie.
app.get('/api/removemovie', function(req, res) {
    var oldmovie = {
        "name": req.query.name,
        "year": req.query.year
    };
    var found = false;
    console.log(oldmovie);
    
    for (var i = 0; i < movies.length; i++) {
        if (movies[i].name == oldmovie.name && movies[i].year == oldmovie.year) {
            console.log("FOUNDIT!");
            found = true;
            movies.splice(i,1);

            MongoClient.connect(url, function(err, db) {
                var collection = db.collection('movies');

                collection.deleteOne({name: oldmovie.name}, function(err, r) {
                    assert.equal(err, null);
                    console.log("Deleted 1 document from the collection.");
                    res.send("success");
                    db.close();
                });
            });
        }
    }
    if (found === false) {
        res.send("Movie not found!");
    }
});

// check a movie in/out.
app.get('/api/checkout', function(req, res) {
    var moviefound = false;
    
    
    for (var i = 0; i < movies.length; i++) {
        if (movies[i].name == req.query.name && movies[i].year == req.query.year) {
            moviefound = true;
            var name = movies[i].name;
            console.log("checking out");
            var newStatus = !movies[i].checkedout;
            movies[i].checkedout = newStatus;
            var updateMe = movies[i];

            MongoClient.connect(url, function(err, db) {
                var collection = db.collection('movies');

                collection.updateOne({name: name}
                    ,updateMe, function(err, r) {
                    assert.equal(err, null);
                    console.log("Deleted 1 document from the collection.");
                    res.send("success");
                    db.close();
                });
            });
        }
    }

    if (moviefound === false) {
        res.send("Unable to locate movie.");
    }
});


var port = 3000;
app.listen(port, function() {
    console.log(`App listening on port ${port}...`);
});