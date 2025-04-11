import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import EmojiPicker from "emoji-picker-react";
import { format } from "timeago.js";
import { toast } from "react-hot-toast";
import { FiLogOut, FiSend, FiSmile, FiImage, FiUsers } from "react-icons/fi";

const Chat = () => {
  const { user, logout } = useAuth();
  const { messages, sendMessage, onlineUsers, requestNotificationPermission } =
    useSocket();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Request notification permission
    const requestPermission = async () => {
      const permission = await requestNotificationPermission();
      if (permission === "granted") {
        toast.success("Notifications enabled");
      }
    };
    requestPermission();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() || image) {
      sendMessage(text, image ? image : null);
      setText("");
      setImage(null);
      setShowEmojiPicker(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5mb limit
        return toast.error("Image size should be less than 5MB");
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText((prevText) => prevText + emojiData.emoji);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-slate-800 p-4 text-white flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Whispr</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowOnlineUsers(!showOnlineUsers)}
            className="flex items-center space-x-1 hover:bg-slate-700 p-2 rounded-lg transition duration-150"
          >
            <FiUsers className="h-4 w-4" />
            <span className="text-sm">{onlineUsers.length} online</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center space-x-1 hover:bg-slate-700 p-2 rounded-lg transition duration-150"
          >
            <FiLogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Online users sidebar */}
        {showOnlineUsers && (
          <div className="w-64 bg-white border-r border-gray-200 shadow-md overflow-y-auto transition-all duration-300 ease-in-out">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-slate-800">Online Users</h2>
            </div>
            <ul className="p-2">
              {onlineUsers.map((onlineUser) => (
                <li
                  key={onlineUser._id}
                  className="flex items-center space-x-2 p-3 hover:bg-gray-50 rounded-lg transition duration-150"
                >
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span
                    className={`text-gray-700 ${user._id === onlineUser._id ? "font-bold" : ""}`}
                  >
                    {onlineUser.username}{" "}
                    {user._id === onlineUser._id && "(You)"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Message area */}
        <div className="flex-1 flex flex-col relative">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-center">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      message.sender._id === user._id
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    <div className="flex items-end space-x-2">
                      {message.sender._id !== user._id && (
                        <span className="text-xs text-gray-600 font-medium">
                          {message.sender.username}
                        </span>
                      )}
                      <div
                        className={`rounded-xl p-3 max-w-xs sm:max-w-md break-words shadow-sm ${
                          message.sender._id === user._id
                            ? "bg-slate-800 text-white"
                            : "bg-white border border-gray-100 text-gray-800"
                        }`}
                      >
                        {message.image && (
                          <div className="mb-2">
                            <img
                              src={message.image}
                              alt="Shared image"
                              className="max-w-full rounded-lg"
                              style={{ maxHeight: "200px" }}
                            />
                          </div>
                        )}
                        {message.text && <p>{message.text}</p>}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 px-2">
                      {format(message.createdAt)}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Image Preview */}
          {image && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <div className="relative inline-block">
                <img
                  src={image}
                  alt="Upload preview"
                  className="h-20 rounded-lg shadow-sm"
                />
                <button
                  onClick={() => setImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 right-4 shadow-lg rounded-lg z-10">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}

          {/* Message Input */}
          <form onSubmit={handleSubmit} className="bg-white border-t border-gray-100 p-4 flex items-center space-x-3 relative">
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              className="p-2 rounded-full hover:bg-gray-100 transition duration-150"
            >
              <FiImage className="text-slate-600 h-5 w-5" />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </button>

            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-full hover:bg-gray-100 transition duration-150"
            >
              <FiSmile className="text-slate-600 h-5 w-5" />
            </button>

            <input 
              type="text" 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              placeholder="Type a message..." 
              className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition duration-200"
            />
            
            <button 
              type="submit" 
              className="bg-slate-800 hover:bg-slate-900 text-white p-3 rounded-full shadow-md transition duration-150"
            >
              <FiSend className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;