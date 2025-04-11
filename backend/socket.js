// FILE: chat-app/backend/socket.js
const socketio = require("socket.io");
const Message = require("./models/Message");
const User = require("./models/User");

const socketSetup = (server) => {
  const io = socketio(server, {
    cors: {
      origin: "https://whispr-frontend-n1ox.onrender.com",
      methods: ["GET", "POST"],
    },
  });

  // Store online users
  const onlineUsers = new Map();

  io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      // Add user to online users
      onlineUsers.set(userId, socket.id);

      try {
        // Get user details
        const user = await User.findById(userId).select("-password");
        if (user) {
          console.log(`User connected: ${user.username}`);

          // Send message history to the connected user
          const messages = await Message.find()
            .sort({ createdAt: 1 })
            .populate("sender", "username");

          socket.emit("message_history", messages);

          // Broadcast online users to all connected clients
          const onlineUsersList = await User.find({
            _id: { $in: Array.from(onlineUsers.keys()) },
          }).select("_id username");

          io.emit("online_users", onlineUsersList);
        }
      } catch (err) {
        console.error("Error on user connection:", err);
      }
    }

    // Handle sending messages
    socket.on("send_message", async (data) => {
      try {
        const user = await User.findById(userId);

        if (user) {
          // Create and save message
          const newMessage = new Message({
            sender: userId,
            text: data.text || "",
            image: data.image || null,
          });
          await newMessage.save();

          // Populate sender info before broadcasting
          const populatedMessage = await Message.findById(
            newMessage._id
          ).populate("sender", "username");

          // Broadcast message to all connected clients
          io.emit("message", populatedMessage);
        }
      } catch (err) {
        console.error("Error sending message:", err);
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      if (userId) {
        console.log(`User disconnected: ${userId}`);

        // Remove from online users
        onlineUsers.delete(userId);

        // Broadcast updated online users list
        const onlineUsersList = await User.find({
          _id: { $in: Array.from(onlineUsers.keys()) },
        }).select("_id username");

        io.emit("online_users", onlineUsersList);
      }
    });
  });

  return io;
};

module.exports = socketSetup;
