// A messaging tools using nodejs
// It uses:
// express - npm install express
// socket.io - npm install socket.io

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Array
var users = [];
var messages10 = [];


io.on('connection', function(socket){
	console.log('Client connected...');

	// Set username
	socket.on('join', function(name){

		// Apparently you can put any member on socket
		socket.username = name;
		users.push(name);		

		// Show to all that I've connected. Add my username in their list
		socket.broadcast.emit('join', socket.username);
		
		// Add all of them to my username list
		users.forEach(function(user) {
			socket.emit("join", user);
		});

		// Populate with last 10 messages
		messages10.forEach(function(message) {
			socket.emit("messages", message.name + ": " + message.data);
		});

		console.log(socket.username + " joined the chat");
		console.log(users);
	});

	// Handler the 'messages' event from the client
	socket.on('messages', function(data){
        var username = socket.username;

        // When you broadcast a message as a result of an event from a socket.
        // The message is emitted to all connected clients except for the socket who triggered the event.
        socket.broadcast.emit('messages', username + ": " + data);

        // Send the same message back to our client
        socket.emit('messages', username + ": " + data);

        // Store messages
        storeMessage(socket.username, data);

        console.log('This will be broadcasted: ' + data);
	});

	socket.on('disconnect', function(){
		removeUser(socket.username);
		socket.broadcast.emit('leave',socket.username);
		console.log(socket.username + ' disconnected');
	});
});

app.get('/', function (req,res){
	res.sendFile(__dirname + '/index.html');
});

server.listen(8080);



// Store last 10 messages
var storeMessage = function(name, data){
	messages10.push({name: name, data: data});
	if (messages10.length > 10) {
		messages10.shift();
	}
}

function removeUser(user){
	for (var i=users.length-1; i>=0; i--) {
		if (users[i] === user) {
			users.splice(i, 1);
		}
	}
};