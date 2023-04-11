const socketio = require('socket.io');

module.exports = (server) => {
  const io = socketio(server);

  io.on('connection', (socket) => {
    socket.on('joinRoom', ({ userId, userName, activityId }) => {
      socket.userId = userId;
      socket.userName = userName;
      socket.room = activityId;

      socket.join(socket.room);

      io.to(socket.room).emit('online', userId);
    });

    socket.on('chatMessage', async (message) => {
      io.to(socket.room).emit('message', message);
    });

    socket.on('disconnect', () => {
      io.to(socket.room).emit('offline', socket.userId);
    });
  });
};
