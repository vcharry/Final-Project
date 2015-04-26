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
var connection_string = 'mongodb://localhost/test';
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
    favorites: [{
        make: String,
        model: String,
        year: Number,
        yearID: Number,
        makeNiceName: String,
        modelNiceName: String
    }],
    following: [String],
    comments: [{
        make: String,
        model: String,
        year: Number,
        yearID: Number,
        makeNiceName: String,
        modelNiceName: String,
        comment: String
    }]
});

var UserModel = mongoose.model('UserModel', UserSchema);

var CarDetailsSchema = new mongoose.Schema({
    make: String,
    model: String,
    year: Number,
    yearID: Number,
    makeNiceName: String,
    modelNiceName: String,
    comments: [{
        user: String,
        comment: String
    }]
});

var CarDetailsModel = mongoose.model('CarDetailsModel', CarDetailsSchema);
/*
var CarSchema = new mongoose.Schema({
    edmundsID: String,
    name: String,
    niceName: String,
    years
})*/

var EdmundsApiKey = '6uxrsuqw542pu8b7d8nx2gj6';
var client = new EdmundsClient({ apiKey: EdmundsApiKey });

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(session({ secret: 'this is the secret', resave: true, saveUninitialized: true }));
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

app.post('/rest/car', function (req, res) {
    var newCar = req.body;
    console.log(newCar);
    CarDetailsModel.findOne({ make: newCar.make, model: newCar.model, year: newCar.year }, function (err, car) {
        console.log(car);
        // car doesnt exist
        if (car == null) {
            // create car
            car = new CarDetailsModel(req.body);
            car.save(function (err, car) {
                CarDetailsModel.findOne(car, function (err, car) {
                    res.json(car);
                });
            });
        }
        // car exists, so return whats currently in DB
        else {
            CarDetailsModel.findOne(car, function (err, car) {
                console.log(car);
                console.log(newCar);

            });
        }
    });
});

app.get("/rest/car", function (req, res) {
    console.log("in get cars");
    CarDetailsModel.find(function (err, cars) {
        res.json(cars);
    });
});

app.put("/rest/car/:id", function (req, res) {
    CarDetailsModel.findById(req.params.id, function (err, car) {
        car.update(req.body, function (err, count) {
            CarDetailsModel.find(function (err, cars) {
                res.json(cars);
            });
        });
    });
});


app.get("/carComments", function (req, res) {
    console.log("in comments");
    CarDetailsModel.find(function (err, cars) {
        res.json(cars);
    });
});


var auth = function (req, res, next) {
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

app.get("/rest/user", auth, function (req, res) {
    console.log("in get");
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

app.get("/makes", function (req, res) {
    //console.log("in makes");
    client.getAllMakes(function (err, makes) {
        //console.log(res.makes);
        res.json(makes);
    });
});

app.post("/make/model/year", function (req, res) {
    console.log("in models");
    console.log(req.body);
    client.getModelYearDetails(req.body, function (err, details) {
        //console.log(details);
        res.json(details);
    });
});

app.post("/styleId/details", function (req, res) {
    console.log("in details");
    console.log(req.body);
    client.getStyleDetails(req.body, function (err, details) {
        //console.log(details);
        res.json(details);
    });
});

app.post("/styleId/photos", function (req, res) {
    console.log("in photos");
    console.log(req.body);
    client.getPhotosByStyle(req.body, function (err, photos) {
        console.log(photos);
        res.json(photos);
    });
});

app.post("/styleId/colors", function (req, res) {
    console.log("in colors");
    console.log(req.body);
    client.getAllColorsByStyle(req.body, function (err, colors) {
        //console.log(colors);
        res.json(colors);
    });
});

app.post("/styleId/options", function (req, res) {
    console.log("in models");
    console.log(req.body);
    client.getAllOptionsByStyle(req.body, function (err, options) {
        //console.log(options);
        res.json(options);
    });
});


// Needs to work remotely and locally
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
// Only defined when running remotely
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

//app.listen(3000);
app.listen(port, ip);