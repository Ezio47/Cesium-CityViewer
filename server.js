var express = require('express');
var api = require('./routes/api');
var app = express();


const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

//allow cross domain
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
};

app.use(allowCrossDomain);
app.use('/', api);

//set angular front end app as static folder
app.use('/angular', express.static('views'));
//allow access to lib folders
app.use('/bower_components', express.static('bower_components'));
app.use('/node_modules', express.static('node_modules'));



if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function (worker, code, signal) {
    console.log('the cluster has crashed ');
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  // start an http server that listens on 3000 port
    var server = app.listen(3000, function () {
        console.log('Example app listening at http://localhost:3000');
    });
}

