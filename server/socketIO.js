const socketio = require('socket.io');
const pool = require('./db/connectDB');
const { formatMessage } = require('./utils');

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
      await pool.query(
        'INSERT INTO chatroom_message(activity_id, member_id, message, send_time) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
        [socket.room, socket.userId, message]
      );
      io.to(socket.room).emit(
        'message',
        formatMessage(socket.userName, message)
      );
    });

    socket.on('disconnect', () => {
      io.to(socket.room).emit('offline', socket.userId);
    });
  });
};
