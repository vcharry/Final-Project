var express = require('express');
var app = express();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(cookieParser())
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

var connectionString = 'mongodb://localhost/cs4550';

// if OPENSHIFT env variables are present, use the available connection info:
/*
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD)
{
    connectionString = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
}*/

var db = mongoose.connect(connectionString);



var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    email: String,
    roles: [String],
    following: [String],
    favorites: [String],
});

var UserModel = mongoose.model('UserModel', UserSchema);

//var user1 = new UserModel({ username: 'valcharry', password: 'cathy429', firstName: 'Val', lastName: 'Charry', email: 'vcharry7@gmail.com', roles: ['student', 'admin'] });
//user1.save();


// Configuring local login strategy
passport.use(new LocalStrategy(
    function (username, password, done) {
    /*    for (var u in users) {
            if (username == users[u].username && password == users[u].password) {
                return done(null, users[u]);
            };
        };
        return done(null, false, { message: 'Unable to login!' });
    */
        console.log(username);
        console.log(password);

        UserModel.findOne({ username: username, password: password }, function (err, user) {
            if (err) {
                
                return done(err);
            }
            if (!user) {
                console.log("EEEEp bad")
                return done(null, false);
            }
            return done(null, user);
        })
    }));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.post("/login", passport.authenticate('local'), function (req, res) {
    console.log("/login");
    console.log(req.body);
    res.json(user);
});


app.post('/register', function (req, res) {
    var newUser = req.body;
    newUser.roles = ['student'];
    UserModel.findOne({ username: newUser.username }, function (err, user) {
        if (err) { return next(err); }
        if (user) {
            res.json(null);
            return;
        }
        var newUser = new UserModel(req.body);
        newUser.save(function (err, user) {
            req.login(user, function (err) {
                if (err) { return next(err); }
                res.json(user);
            });
        });
    });
});


// Needs to work remotely and locally
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
// Only defined when running remotely
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

//app.listen(3000);
app.listen(port, ip);