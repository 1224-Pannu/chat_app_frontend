// ChatContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [token] = useState(localStorage.getItem("token"));

  const { socket, axios, authUser } = useContext(AuthContext);

  // Fetch all users
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error.message);
      console.error("❌ Error fetching users:", error);
    }
  };

  // Fetch messages with a specific user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
      console.error("❌ Error fetching messages:", error);
    }
  };

  // Send message
  const sendMessage = async (receiverId, text = "", image = "") => {
    if (!authUser?._id) {
      toast.error("You must be logged in to send messages");
      return;
    }
    if (!token) {
      toast.error("Authentication token missing. Please log in again.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/send/${receiverId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text, image }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error sending message");
        return;
      }

      // Normalize message object
      const sentMessage = data.message || data;
      if (!sentMessage.receiverId) {
        sentMessage.receiverId = receiverId;
      }

      setMessages((prev) => [...prev, sentMessage]);

      if (socket) {
        socket.emit("sendMessage", sentMessage);
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
      toast.error(err.message);
    }
  };

  // Socket listener for new messages
  const subscribeToMessages = () => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id)
      ) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);

        axios
          .put(
            `/api/messages/mark/${newMessage._id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .catch((err) =>
            console.error("❌ Error marking message as seen:", err)
          );
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  };

  useEffect(() => {
    if (socket) {
      return subscribeToMessages();
    }
  }, [socket, selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        getUsers,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
