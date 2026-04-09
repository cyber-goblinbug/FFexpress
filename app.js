var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');
const fs = require('fs');
const  Sequelize  = require('sequelize');
const  DataTypes  = require('sequelize');



// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

//Register Partials
hbs.registerPartials(path.join(__dirname, 'views/partials'));
hbs.registerPartial('partial_name','partial value');




// Setup out Database
const dataDirectory = path.join(__dirname, 'data');
const storage = path.join(dataDirectory, 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: require('sqlite3'),
  storage,
  logging: true
});
const Task = sequelize.define('Task', {
  name: {
    type: DataTypes.STRING,
    allowNull: false}, 
    description: {type: DataTypes.TEXT,allowNull: false}
});
async function syncDB() {
  await sequelize.sync( );

};
syncDB().catch(console.error);

//Get Home Page
app.get('/', function(req, res)  {
  res.render('index', { title: 'Miami' });
});

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
