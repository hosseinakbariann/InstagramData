let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let mongodbutil = require( './mongoUtil' );
let browserUtil = require( './browser' );
let indexRouter = require('./routes/index');
let dataRouter = require('./routes/data');
let PORT = 3000;

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/data', dataRouter);

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

app.listen(PORT, function(err){
    if (err) console.log("Error in server setup");
    console.log("Server listening on Port", PORT);
});

mongodbutil.connectToServer( function( err ) {
    console.log('mongo started');
});
browserUtil.openBrowser( function( err ) {
});


module.exports = app;
