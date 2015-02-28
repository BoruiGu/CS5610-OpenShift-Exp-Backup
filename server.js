var express = require('express');
var app = express();

var ip = process.env.OPENSHIFT_NODEJS_IP || 127.0.0.1;
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(port, ip);