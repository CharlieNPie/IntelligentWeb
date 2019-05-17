var express = require("express");
var http = require("http");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require("express-session");

var UserObject = require("./models/user")

var index = require("./routes/index");
var users = require("./routes/users");

var app = express();


// Connect to hosted database
mongoose.connect("mongodb://127.0.0.1:27017/manifest", {
  useNewUrlParser: true,
  useCreateIndex: true
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));


//Passport configuration
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;



// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({ secret: "cats" }));
app.use(passport.initialize());
app.use(passport.session());

app.use("/", index);
app.use("/users", users);

passport.use(new LocalStrategy(
  function (username, password, done) {
    UserObject.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

//serialization
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  UserObject.findById(id, function (err, user) {
    done(err, user);
  });
});

// check authentication
app.use(function (req, res, next) {
  res.locals.login = req.isAuthenticated();
  console.log(req.isAuthenticated);
  next();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
