var express = require("express"),
	app = express(),
	http = require('http').Server(app),
	path = require('path'),
	io = require('socket.io')(http),
	dl = require('delivery'),
	fs = require('fs'),
	nombres_usuarios = {};

var port = process.env.PORT || '3000';

app.use(express.static('public'));


app.get('/',function(peticion,respuesta){
		respuesta.sendFile(path.normalize(__dirname + "/../public/index.html"));
});

io.sockets.on('connection' ,function(socket){
	

	socket.on('sendMessage' , function(data){

		io.sockets.emit('newMessage', {msg:data, nombre:socket.nombre_usuario});
	});

	socket.on("newUser", function(data, callback){

		if (data in nombres_usuarios){
			callback(false);
		}
		else{
			callback(true);
			socket.nombre_usuario = data;
			io.sockets.emit('user_connected', {msg:data, nombre:socket.nombre_usuario} );
			nombres_usuarios[socket.nombre_usuario] = 1;
			actualizar_usuarios();
		}
	})

	socket.on('disconnect', function(data){
		io.sockets.emit('user_disconnect', {msg:data, nombre:socket.nombre_usuario});
		if (socket.nombre_usuario){
			delete nombres_usuarios[socket.nombre_usuario];
			actualizar_usuarios();
			
		}
	});

	socket.on('writing' , function(data){
		socket.broadcast.emit('typing', {msg:data, nombre:socket.nombre_usuario});
	})

	socket.on('stopWriting' ,function(data){
		socket.broadcast.emit('noTyping');
	})

	function actualizar_usuarios(){
		io.sockets.emit('Usuarios', nombres_usuarios);
	}
 	
 	socket.on('user_image', function (data) {
        io.sockets.emit('user_image', {nombre:socket.nombre_usuario,msg:data});
    });

});



http.listen(port,function(){
	console.log("OK. Aplicacion escuchando en puerto 3000");
});

