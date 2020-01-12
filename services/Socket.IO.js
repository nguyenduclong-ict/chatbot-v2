const socketIO = require('socket.io');
/** @type {SocketIO.Server} */
var io;

const jwt = require('express-extra-tool').jwt;
const { getUser } = _rq('providers/UserProvider');

function initSocketIO(http) {
  io = socketIO(http);
  io.on('connection', function(socket) {
    _log('user connected ', socket.id);
    socket.on('subscribe', async function({ pageId, userId, token }) {
      // join userId
      if (userId) {
        console.log('join', socket.id, 'to ', userId);
        socket.join(userId);
        socket.emit('notify', {
          type: 'success',
          message: 'join ' + socket.id + ' to room("userId") : ' + userId,
          slient: true
        });
      }

      // join userId
      if (token) {
        let tokenData = jwt.verify(token);
        const user = await getUser({
          email: tokenData.email,
          username: tokenData.username
        });
        socket.join(user._id);
        _log('socket join user ', user);
        socket.emit('notify', {
          type: 'success',
          message: 'join ' + socket.id + ' to room("userId") : ' + user._id,
          slient: true
        });
      }

      // join pageId
      if (pageId) {
        console.log('join', socket.id, 'to ', pageId);
        socket.join(pageId);
        socket.emit('notify', {
          type: 'success',
          message: 'join ' + socket.id + ' to room("pageId") : ' + pageId,
          slient: true
        });
      }
    });
  });
}

function socketio() {
  return io;
}
module.exports = { socketio, initSocketIO };
