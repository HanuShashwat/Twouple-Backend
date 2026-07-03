const jwt = require('jsonwebtoken');

// Keep track of connected users: mapping userId -> socketId
const connectedUsers = new Map();
let ioInstance = null;

exports.init = (io) => {
  ioInstance = io;
  
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      const tokenValue = token.replace('Bearer ', '');
      const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);
    
    // Store user connection
    connectedUsers.set(socket.userId, socket.id);

    // When the user explicitly requests to join a relationship room
    socket.on('join_relationship', (relationshipId) => {
      socket.join(relationshipId);
      console.log(`User ${socket.userId} joined relationship room: ${relationshipId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      connectedUsers.delete(socket.userId);
    });
  });
};

/**
 * Emits a new message event to the appropriate relationship room
 */
exports.emitNewMessage = (relationshipId, messageData) => {
  if (ioInstance && relationshipId) {
    ioInstance.to(relationshipId).emit('new_message', messageData);
  }
};
