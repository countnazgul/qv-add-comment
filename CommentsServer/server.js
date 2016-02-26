var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var async = require('async');
var swig = require('swig');
var cons = require('consolidate');
var Datastore = require('nedb');
var js2xmlparser = require("js2xmlparser");
var config = require('./config');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var commentsdb = new Datastore({
  filename: 'data/comments.db',
  autoload: true
});

commentsdb.loadDatabase(function(err) { // Callback is optional
  console.log('"comments" db is loaded');
});

var port = config.main.port;
var server = app.listen(port, function() {
  console.log('Server is listening at http://%s:%s', "localhost", port);
});

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.get('/comments', function(req, res) {
  commentsdb.find({ }, { comment: 1, dateAdded: 1, user: 1, selections: 1, variableContent: 1,_id: 0 }).sort({ dateAdded: -1 }).exec( function (err, docs) {
    res.send(docs)
  });
});

app.get('/commentsxml', function(req, res) {
  commentsdb.find({ }, { comment: 1, dateAdded: 1, user: 1, selections: 1, variableContent: 1, _id: 0 }, function (err, docs) {
    res.send( js2xmlparser("comments", {comments: docs }) )
  });
});

app.post('/addcomment', function(req, res) {
  var data = req.body;

  commentsdb.insert({	
    comment: data.comment,
	dateAdded: data.dateAdded,
	user: data.user,
	selections: data.selections,
	variableContent: data.variableContent
  }, function(err, newTask) {
    res.send({ "status": "done" })
  });
});
