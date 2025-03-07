require("dotenv").config({path:"./.env"})
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


const passport = require("passport");
const session = require("express-session");
const UserSchema = require("./models/user.schema");


const fileupload = require("express-fileupload");


// connect flash
const flash = require("connect-flash")


// db connection
require("./config/db")


const expenseRouter = require("./routes/expense.routes")
var indexRouter = require('./routes/index.routes');
var usersRouter = require('./routes/users.routes');


var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// logger
app.use(logger('dev'));

// bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// static route
app.use(express.static(path.join(__dirname, 'public')));


app.use(fileupload());



// passport and session config
app.use(
  session({
      secret: process.env.EXPRESS_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
       cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60 * 24,
        },
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});


app.use(flash());

// base route
app.use('/', indexRouter);
app.use("/expense",expenseRouter)
app.use('/user', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
