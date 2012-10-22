// Create a global instance of socket.io.
// This will make it possible to use it across the app including in the routes
var io = require('socket.io'),
    ioListen;

exports.init = function(server){
    ioListen = io.listen(server);

    ioListen.sockets.on('connection', function (socket) {
        socket.emit('connection-on', { status: 'Connection is on.' });

        // When a client makes an offer
        socket.on('client-offer', function (data) {
            // Tell the rest of the world
            socket.broadcast.emit('offer-made', { status: 'A client made an offer for ' + data.gig.title, gig: data.gig });
        });
    });
    ioListen.sockets.on('disconnect', function (socket) {
        socket.emit('user-disconnected', { status: 'User disconnected.' });
    });
}

// Expose the socket.io listener
exports.sio = function() {
    return ioListen;
}
