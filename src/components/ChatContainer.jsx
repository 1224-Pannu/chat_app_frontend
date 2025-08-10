import React, { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../client/ChatContext";
import { AuthContext } from "../../client/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Send text message
  const handleSendMessage = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (input.trim() === "") return;

    if (!selectedUser?._id) {
      toast.error("No user selected");
      return;
    }

    console.log(`📤 Sending text message to ${selectedUser._id}`);
    await sendMessage(selectedUser._id, input.trim(), "");
    setInput("");
    setIsTyping(false);
  };

  // Send image message
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (!selectedUser?._id) {
      toast.error("No user selected");
      return;
    }

    console.log(`📤 Sending image message to ${selectedUser._id}`);
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage(selectedUser._id, "", reader.result);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUser) {
      console.log(`📡 Loading chat with ${selectedUser._id}`);
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 py-3 px-4 border-b border-stone-500 bg-white/5 backdrop-blur-sm"
      >
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2 font-medium">
          {selectedUser.fullName}
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              onlineUsers.includes(selectedUser._id)
                ? "bg-green-500 animate-pulse"
                : "bg-gray-500"
            }`}
            title={
              onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"
            }
          ></span>
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7 cursor-pointer hover:scale-110 transition"
        />
        <img
          src={assets.help_icon}
          alt=""
          className="max-md:hidden max-w-5 cursor-pointer hover:rotate-12 transition"
        />
      </motion.div>

      {/* Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-4 pb-6 space-y-3">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              damping: 14,
              stiffness: 100,
              delay: index * 0.03,
            }}
            className={`flex items-end gap-2 ${
              msg.senderId !== authUser._id && "flex-row-reverse"
            }`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                alt=""
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8 shadow-md"
              />
            ) : (
              <p
                className={`p-3 max-w-[240px] md:text-sm font-light rounded-lg mb-8 break-words shadow-md transition-all duration-200 ${
                  msg.senderId === authUser._id
                    ? "bg-violet-500/40 text-white rounded-br-none"
                    : "bg-gray-700/50 text-white rounded-bl-none"
                }`}
              >
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs text-gray-400 space-y-1">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className="w-7 rounded-full border border-gray-600"
              />
              <p>{formatMessageTime(msg.createdAt)}</p>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            className="flex justify-start items-center gap-2 text-sm text-gray-300 italic pl-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-gray-700/40 px-3 py-2 rounded-full">
              <span className="inline-block animate-bounce">💬</span> Typing...
            </div>
          </motion.div>
        )}

        <div ref={scrollEnd}></div>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50 rounded shadow-lg">
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="absolute -top-3 -right-3 bg-gray-800 text-white w-7 h-7 flex items-center justify-center rounded-full text-lg hover:bg-red-600 z-10"
            >
              ✕
            </button>
            <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
          </div>
        </div>
      )}

      {/* Input */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-4 bg-black/20 backdrop-blur-md"
      >
        <div className="flex-1 flex items-center bg-gray-100/10 px-4 py-2 rounded-full border border-gray-500 hover:border-violet-500 transition">
          <input
            onChange={handleTyping}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-sm text-white p-2 outline-none placeholder-gray-400"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="upload"
              className="w-5 mr-2 cursor-pointer hover:scale-110 transition"
            />
          </label>
          <img
            src="https://img.freepik.com/free-vector/all-right-emoji-illustration_23-2151298395.jpg"
            alt="emoji"
            className="w-5 mr-2 cursor-pointer hover:scale-110 transition"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />
        </div>
        <motion.img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="send"
          whileHover={{ scale: 1.2, rotate: -10 }}
          whileTap={{ scale: 0.9 }}
          className="w-7 cursor-pointer drop-shadow-[0_0_10px_#a855f7] transition"
        />
      </motion.div>
    </div>
  ) : (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center gap-3 text-gray-400 bg-white/10 max-md:hidden"
    >
      <img src={assets.new_icon} className="max-w-20 mt-1.5 ml-1.5" alt="" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
      <p className="text-sm">Select a user to start chatting</p>
    </motion.div>
  );
};

export default ChatContainer;
