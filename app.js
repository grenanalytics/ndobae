"use strict"
var createError = require('http-errors');
var express = require('express');
var router = express.Router();
var flash = require('connect-flash');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var validator = require('express-validator');
var helmet = require('helmet');
var compression = require('compression');
var cors = require('cors');
var csrf = require('csurf');

require('./config/config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();


// view engine setup
app.use(compression());
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(helmet());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use(flash());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.get("/manifest.json", (req, res)=>{
  res.header("Content-Type", "text/cache-manifest");
  res.sendFile(path.join(__dirname, "manifest.json"));
});




app.use(session({
  secret:"total jdijn  54u892n JNGRNOHNHSu895tnwuj88*8ytg6FG6GB989hqg2g3729nw9wns",
  resave:false,
  saveUninitialized:true,
  unset:'destroy'

}));
/*app.use(validator({
  errorFormatter:function(param,msg, value){
    var namespace = param.split('.'),
    root =namespace.shift(),
    foreParam=root;
  while(namespace.length){
    foreParam+='['+ namespace.shift() +']';
  }
  return{
    param:foreParam,
    msg:msg,
    value:value
  }  
  }
}));*/



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err;
  res.locals.error = " ";

  // render the error page
  res.status(err.status || 500);

  res.render('error');
});
app.use(csrf({ cookie: true }))
module.exports = app;
