const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('../../public_html/blockland1/'));
app.use(express.static('../../public_html/libs'));
// app.use(express.static('../../public_html/blockland/v3'));
app.get('/',function(req, res) {
    res.sendFile(__dirname + '../../public_html/blockland1/index.html');
});

io.sockets.on('connection', function(socket){
	socket.userData = { x:0, y:0, z:0, heading:0 };//Default values;
 
	console.log(`${socket.id} connected`);
	socket.emit('setId', { id:socket.id });
	
    socket.on('disconnect', function(){
		console.log(`roomID: ${socket.id} in ${socket.roomID} disconnected`);
		socket.to(socket.roomID).emit('deletePlayer', { id: socket.id });
		// socket.broadcast.emit('deletePlayer', { id: socket.id });
    });	
	
	socket.on('init', function(data){
		socket.join(data.roomID);
		socket.roomID = data.roomID;
		console.log(`socket.init ${data.model}`);
		socket.userData.model = data.model;
		socket.userData.colour = data.colour;
		socket.userData.x = data.x;
		socket.userData.y = data.y;
		socket.userData.z = data.z;
		socket.userData.heading = data.h;
		socket.userData.pb = data.pb,
		socket.userData.action = "Idle";
	});
	
	socket.on('update', function(data){
		socket.userData.x = data.x;
		socket.userData.y = data.y;
		socket.userData.z = data.z;
		socket.userData.heading = data.h;
		socket.userData.pb = data.pb,
		socket.userData.action = data.action;
	});
	
	socket.on('chat message', function(data){
		console.log(`chat message: ${data.id} ${data.message}`);
		io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
		// socket.broadcast.emit("chat message", msg);
	})
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

setInterval(function(){
	console.log( io.of("/").adapter.rooms);
	// const nsp = io.of('/').adapter.rooms;
	const nsp = io.of('/');
	let pack = {};
    // let pack = [];
	
    for(let id in io.sockets.sockets){
        const socket = nsp.connected[id];
		//Only push sockets that have been initialised
		// only push same room pack
		if (socket.userData.model!==undefined){
			if (pack[socket.roomID]===undefined||pack[socket.roomID]==undefined) pack[socket.roomID] = [];
			pack[socket.roomID].push({
				id: socket.id,
				model: socket.userData.model,
				colour: socket.userData.colour,
				x: socket.userData.x,
				y: socket.userData.y,
				z: socket.userData.z,
				heading: socket.userData.heading,
				pb: socket.userData.pb,
				action: socket.userData.action
			});
			// pack.push({
			// 	id: socket.id,
			// 	model: socket.userData.model,
			// 	colour: socket.userData.colour,
			// 	x: socket.userData.x,
			// 	y: socket.userData.y,
			// 	z: socket.userData.z,
			// 	heading: socket.userData.heading,
			// 	pb: socket.userData.pb,
			// 	action: socket.userData.action
			// });    
		}
    }
	if (pack.length>0) {io.emit('remoteData', pack);}
}, 40);