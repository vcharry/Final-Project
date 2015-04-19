var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var EdmundsClient = require('node-edmunds-api');
var mongoose = require('mongoose');


// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/finalproject';
// if OPENSHIFT env variables are present, use the available connection info:
if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
}

var db = mongoose.connect(connection_string);

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    favorites: [String],
    following: [String]
});

var UserModel = mongoose.model('UserModel', UserSchema);

/*
var EdmundsApiKey = '6uxrsuqw542pu8b7d8nx2gj6';
var client = new EdmundsClient({ apiKey: EdmundsApiKey });

client.decodeVin({ vin: 'SOME-VIN-HERE' }, function(err, res) {
      console.log(res.make);
      console.log(res.model);
    });*/

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
//app.use(session({ secret: 'this is the secret' }));
app.use(cookieParser())
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

passport.use(new LocalStrategy(
function (username, password, done) {
    UserModel.findOne({ username: username, password: password }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
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
    var user = req.user;
    console.log(user);
    res.json(user);
});

app.get('/loggedin', function (req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
});

app.post('/logout', function (req, res) {
    req.logOut();
    res.send(200);
});

app.post('/register', function (req, res) {
    var newUser = req.body;
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

var auth = function (req, res, next) {
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

app.get("/rest/user", auth, function (req, res) {
    UserModel.find(function (err, users) {
        res.json(users);
    });
});

app.delete("/rest/user/:id", auth, function (req, res) {
    UserModel.findById(req.params.id, function (err, user) {
        user.remove(function (err, count) {
            UserModel.find(function (err, users) {
                res.json(users);
            });
        });
    });
});

app.put("/rest/user/:id", auth, function (req, res) {
    UserModel.findById(req.params.id, function (err, user) {
        user.update(req.body, function (err, count) {
            UserModel.find(function (err, users) {
                res.json(users);
            });
        });
    });
});

app.post("/rest/user", auth, function (req, res) {
    UserModel.findOne({ username: req.body.username }, function (err, user) {
        if (user == null) {
            user = new UserModel(req.body);
            user.save(function (err, user) {
                UserModel.find(function (err, users) {
                    res.json(users);
                });
            });
        }
        else {
            UserModel.find(function (err, users) {
                res.json(users);
            });
        }
    });
});



// Needs to work remotely and locally
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
// Only defined when running remotely
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

//app.listen(3000);
app.listen(port, ip);