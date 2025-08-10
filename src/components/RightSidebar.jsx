import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import assets from "../assets/assets";
import { ChatContext } from "../../client/ChatContext";
import { AuthContext } from "../../client/AuthContext";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  // get all the images from the messages and set them to state
  useEffect(() => {
    if (messages && messages.length > 0) {
      setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
    } else {
      setMsgImages([]);
    }
  }, [messages]);

  return (
    selectedUser && (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-[#1e1e2f]/80 backdrop-blur-md text-white w-full relative overflow-y-scroll rounded-l-xl shadow-2xl border-l border-purple-600/20 max-md:hidden"
      >
        {/* Top Glow Line */}
        <div className="h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 w-full animate-pulse shadow-md" />

        <div className="pt-16 flex flex-col items-center gap-4 text-xs font-light mx-auto">
          {/* Profile Image with glow */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative group transition-all duration-300"
          >
            <img
              src={selectedUser?.profilePic || assets.avatar_icon}
              alt="User"
              className="w-24 aspect-square rounded-full shadow-2xl ring-4 ring-purple-500/50 group-hover:ring-pink-500/50 transition duration-300"
            />
            <span
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#1e1e2f] ${
                selectedUser.isOnline ? "bg-green-500" : "bg-gray-500"
              }`}
            />
          </motion.div>

          {/* Name */}
          <h1 className="text-xl font-semibold tracking-wide flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                selectedUser.isOnline
                  ? "bg-green-400 animate-ping"
                  : "bg-gray-500"
              }`}
            />
            <span
              className={`relative w-2 h-2 rounded-full ${
                selectedUser.isOnline ? "bg-green-500" : "bg-gray-500"
              }`}
            />
            {selectedUser.fullName}
          </h1>

          {/* Bio */}
          <p className="px-8 text-sm text-center text-gray-400 leading-relaxed italic">
            {selectedUser.bio || "No bio added yet."}
          </p>
        </div>

        <hr className="border-[#ffffff20] my-4 w-11/12 mx-auto" />

        {/* Media Section */}
        <div className="px-6 text-xs">
          <p className="uppercase tracking-widest text-[11px] text-gray-500 mb-2">
            Shared Media
          </p>
          <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/60 scrollbar-track-transparent">
            {msgImages.map((url, index) => (
              <motion.div
                key={index}
                onClick={() => window.open(url, "_blank")}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer rounded overflow-hidden shadow-md hover:shadow-violet-500/40 transition duration-300"
              >
                <img
                  src={url}
                  alt={`media-${index}`}
                  className="w-full h-full object-cover rounded-md"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <motion.button
          onClick={logout}
          className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium py-2 px-12 rounded-full cursor-pointer shadow-lg transition-all duration-300"
        >
          Logout
        </motion.button>
      </motion.div>
    )
  );
};

export default RightSidebar;
