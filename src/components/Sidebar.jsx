import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import assets from "../assets/assets";
import newImage from "../assets/newimage.png";
import { AuthContext } from "../../client/AuthContext";
import { ChatContext } from "../../client/ChatContext";
import axios from "axios";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers, authUser } = useContext(AuthContext); // ✅ included authUser

  const [input, setInput] = useState("");
  const navigate = useNavigate();

  // ✅ Filter users excluding the logged-in user
  const filteredUsers = input
    ? users.filter(
        (user) =>
          user._id !== authUser?._id &&
          user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users.filter((user) => user._id !== authUser?._id);

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const userVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className={`bg-gradient-to-b from-[#181a2f]/80 to-[#262845]/80 h-full p-5 rounded-r-3xl backdrop-blur-md shadow-2xl overflow-y-scroll text-white transition-all duration-500 ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* Header */}
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            src={newImage}
            alt="GuturGu Logo"
            className="max-w-36"
          />

          {/* Dropdown Menu */}
          <div className="relative py-2 group">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer transition-transform duration-300 hover:rotate-90"
            />
            <div className="absolute top-full right-0 z-20 w-36 p-5 rounded-xl bg-[#292c4a] border border-gray-600 text-gray-100 hidden group-hover:block shadow-xl">
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm hover:text-violet-400 transition"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-gray-500" />
              <p
                onClick={logout}
                className="cursor-pointer text-sm hover:text-red-400 transition"
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[#1f2038]/80 rounded-full flex items-center gap-2 py-3 px-4 mt-5 ring-1 ring-white/10 focus-within:ring-violet-400 transition-all duration-300 shadow-inner">
          <img src={assets.search_icon} alt="search" className="w-4" />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            value={input}
            className="bg-transparent border-none outline-none text-white text-sm flex-1 placeholder:text-gray-400"
            placeholder="Search here..."
          />
        </div>
      </div>

      {/* User List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3"
      >
        {filteredUsers.map((user, index) => (
          <motion.div
            variants={userVariants}
            whileHover={{
              scale: 1.04,
              backgroundColor: "#2f2c56",
              boxShadow: "0 0 12px rgba(168, 129, 255, 0.3)",
            }}
            transition={{ type: "spring", stiffness: 150 }}
            onClick={() => {
              setSelectedUser(user);
              setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
            }}
            key={index}
            className={`relative flex items-center gap-3 p-3 pl-4 rounded-xl cursor-pointer group transition-colors duration-300 ${
              selectedUser?._id === user._id
                ? "bg-[#3b3260]/80 border border-violet-500 shadow-md"
                : "hover:bg-[#282142]/40"
            }`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt="avatar"
              className="w-[42px] h-[42px] rounded-full object-cover border-2 border-violet-300 group-hover:ring-2 group-hover:ring-violet-400 transition"
            />
            <div className="flex flex-col leading-5">
              <p className="text-sm font-semibold">{user.fullName}</p>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-xs font-medium ${
                  onlineUsers.includes(user._id)
                    ? "text-green-400"
                    : "text-neutral-400"
                }`}
              >
                ● {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </motion.span>
            </div>

            {/* Badge */}
            {unseenMessages[user._id] > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 120 }}
                className="absolute top-3 right-3 text-[10px] h-5 w-5 flex justify-center items-center rounded-full bg-violet-500 text-white font-bold shadow-md"
              >
                {unseenMessages[user._id]}
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
