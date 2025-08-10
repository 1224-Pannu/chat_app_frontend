import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();
AuthContext.displayName = "AuthContext";

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Check token on mount
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [token]);

  // ✅ Verify auth from backend
  async function checkAuth() {
    try {
      const { data } = await axios.get("/api/auth/check-auth");
      if (data.success && data.user?._id) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        logout(true);
      }
    } catch (err) {
      console.error("❌ Auth check failed:", err);
      logout(true);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Login
  async function login(state, credentials) {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success && data.userData?._id) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setAuthUser(data.userData);
        connectSocket(data.userData);
        toast.success(data.message);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      toast.error(err.response?.data?.message || "Login failed");
    }
  }

  // ✅ Logout
  function logout(silent = false) {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["Authorization"];
    socket?.disconnect();
    if (!silent) toast.success("Logged out");
  }

  // ✅ Update profile
  async function updateProfile(updatedFields) {
    try {
      const { data } = await axios.put("/api/auth/update", updatedFields);
      if (data.success && data.user?._id) {
        setAuthUser(data.user);
        toast.success(data.message || "Profile updated");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      console.error("❌ Update profile error:", err);
      toast.error(err.response?.data?.message || "Update error");
    }
  }

  // ✅ Connect socket with userId
  function connectSocket(userData) {
    if (!userData?._id) {
      console.warn("⚠️ No userId found, cannot connect socket.");
      return;
    }
    if (socket?.connected) {
      console.warn("⚠️ Socket already connected.");
      return;
    }

    console.log("🔌 Connecting socket for user:", userData._id);

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    newSocket.on("connect", () => {
      console.log("📡 Socket connected:", newSocket.id);
      // Join personal room for direct messages
      newSocket.emit("join", userData._id);
      console.log(`🏠 Joined personal room: ${userData._id}`);
    });

    newSocket.on("getOnlineUsers", (users) => {
      console.log("👥 Online users updated:", users);
      setOnlineUsers(users);
    });

    // Debug listener for new messages
    newSocket.on("newMessage", (msg) => {
      console.log("📨 Real-time message received (AuthContext debug):", msg);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    setSocket(newSocket);
  }

  // ✅ Emit addUser event when connected
  useEffect(() => {
    if (socket && authUser?._id) {
      console.log("📢 Emitting addUser:", authUser._id);
      socket.emit("addUser", authUser._id);

      socket.on("onlineUsers", (users) => {
        console.log("📋 onlineUsers event received:", users);
        setOnlineUsers(users);
      });

      return () => {
        console.log("🧹 Cleaning up onlineUsers listener");
        socket.off("onlineUsers");
      };
    }
  }, [socket, authUser]);

  const value = {
    authUser,
    currentUser: authUser, // ✅ extra alias for old code
    setAuthUser,
    login,
    logout,
    updateProfile,
    onlineUsers,
    socket,
    loading,
    axios,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
