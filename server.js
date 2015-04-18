var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/test');

var express = require('express');
var app = express();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var bodyParser = require('body-parser');
var multer = require('multer');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(passport.initialize());
app.use(express.static(__dirname + '/public'));

// Configuring local login strategy
passport.use(new LocalStrategy(
    function (username, password, done) {
        for (var u in users) {
            if (username == users[u].username && password == users[u].password) {
                return done(null, users[u]);
            };
        };
        return done(null, false, { message: 'Unable to login!' });
    }
    ));




app.post("/login", passport.authenticate('local'), function (req, res) {
    console.log("/login");
    console.log(req.body);
});




app.listen(3000);