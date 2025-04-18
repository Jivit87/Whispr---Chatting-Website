import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io("https://whispr-backend.onrender.com", {
        query: { userId: user._id },
      });

      setSocket(newSocket);

      // Listen for messages
      newSocket.on("message", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);

        // Push notification if browser supports it and the window is not focused
        if (
          "Notification" in window &&
          Notification.permission === "granted" &&
          !document.hasFocus()
        ) {
          new Notification("New Message", {
            body: `${message.sender.username}: ${message.text}`,
            icon: "/logo.png",
          });
        }
      });

      // Listen for initial message history
      newSocket.on("message_history", (history) => {
        setMessages(history);
      });

      // Listen for online users updates
      newSocket.on("online_users", (users) => {
        setOnlineUsers(users);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const sendMessage = (text, image = null) => {
    if (socket && (text.trim() || image)) {
      socket.emit("send_message", { text, image });
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return null;
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        messages,
        sendMessage,
        onlineUsers,
        requestNotificationPermission,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
