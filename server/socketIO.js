const socketio = require('socket.io');
const pool = require('./db/connectDB');
const { formatMessage } = require('./utils');

const activityModel = require('./models/activity_model');

module.exports = (server) => {
  const io = socketio(server);
  const userList = {};

  io.on('connection', (socket) => {
    socket.on('joinRoom', ({ userId, userName, activityId }) => {
      socket.userId = userId;
      socket.userName = userName;
      socket.room = activityId;

      socket.join(socket.room);

      if (!userList[socket.room]) userList[socket.room] = [];
      userList[socket.room].push(userId);

      io.to(socket.room).emit('online', userList[socket.room]);
    });

    socket.on('chatMessage', async (message) => {
      await activityModel.sendMessage(socket.room, socket.userId, message);

      io.to(socket.room).emit(
        'message',
        formatMessage(socket.userName, message)
      );
    });

    socket.on('disconnect', () => {
      if (userList[socket.room]) {
        const index = userList[socket.room].indexOf(socket.userId);
        if (index !== -1) {
          userList[socket.room].splice(index, 1);
          if (userList[socket.room].length === 0) {
            delete userList[socket.room];
          }
        }
      }
      io.to(socket.room).emit('offline', socket.userId);
    });
  });
};
