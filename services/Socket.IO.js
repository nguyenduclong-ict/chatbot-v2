const socketIO = require('socket.io');
/** @type {SocketIO.Server} */
var io;

function initSocketIO(http) {
  io = socketIO(http);
  io.on('connection', function(socket) {
    _log('user connected ', socket.id);
    socket.on('subscribe', function(pageId) {
      console.log('join', socket.id, 'to ', pageId);
      socket.join(pageId);
      socket.emit('notify', {
        type: 'success',
        message: 'join ' + socket.id + ' to room : ' + pageId,
        slient: true
      });
    });
  });
}

function socketio() {
  return io;
}
module.exports = { socketio, initSocketIO };
