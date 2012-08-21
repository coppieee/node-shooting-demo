
/**
 * Module dependencies.
 */
"use strict";
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();


app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/game', routes.game);
app.get('/gameover', routes.gameover);

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server,{'log level':1});
var _userId = 0;
io.sockets.on('connection',function(socket){
	socket.handshake.userId = _userId;
	_userId ++;
	socket.on('player-update',function(data){
		socket.broadcast.json.emit('player-update',{userId:socket.handshake.userId,data:data});
	});
	socket.on('bullet-create',function(data){
		socket.broadcast.json.emit('bullet-create',{userId:socket.handshake.userId,data:data});
	});
	socket.on('disconnect',function(){
		socket.broadcast.json.emit('disconnect-user',{userId:socket.handshake.userId});
	});
});
