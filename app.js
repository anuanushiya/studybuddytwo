var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

app.set('port', process.env.PORT || 8000);

app.use(express.static(path.join(__dirname, 'static')));

// Allows for HTML5 mode
app.all('/*', function(req, res, next) {
    res.sendfile('/static/index.html', { root: __dirname });
});
var local_uri = 'mongodb://localhost/studybuddy';
var database_uri = process.env.MONGOLAB_URI || local_uri;
mongoose.connect(database_uri, function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});