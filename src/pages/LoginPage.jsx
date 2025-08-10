import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import assets from "../assets/assets";
import { AuthContext } from "../../client/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const onSubmitHandler = (event) => {
    event.preventDefault();

    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    login(currState === "Sign up" ? "signup" : "login", {
      fullName,
      email,
      password,
      bio,
    });
  };

  const toggleForm = () => {
    setCurrState(currState === "Sign up" ? "Login" : "Sign up");
    setIsDataSubmitted(false);
    setFullName("");
    setEmail("");
    setPassword("");
    setBio("");
    setAgreedToTerms(false);
  };

  const handleCreateAccount = async () => {
    if (!agreedToTerms) {
      alert("Please agree to the terms to continue.");
      return;
    }

    // Submit signup request
    await login("signup", {
      fullName,
      email,
      password,
      bio,
    });
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl px-4">
      {/* Left Side */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center justify-center text-white"
      >
        <motion.img
          src={assets.new_icon}
          alt="Logo"
          className="w-[min(30vw,250px)] mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        <motion.h1
          className="text-5xl font-bold tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          GuturGu
        </motion.h1>
      </motion.div>

      {/* Form Side */}
      <motion.form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/10 text-white border-gray-500 p-8 flex flex-col gap-6 rounded-xl shadow-xl w-full max-w-md backdrop-blur-md"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState === "Sign up" ? "Sign Up" : "Welcome back"}
          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt=""
              className="w-5 cursor-pointer"
            />
          )}
        </h2>

        {currState === "Sign up" && !isDataSubmitted && (
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className="p-2 border border-gray-500 rounded-md bg-transparent placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="p-2 border border-gray-500 rounded-md bg-transparent placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="p-2 border border-gray-500 rounded-md bg-transparent placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-white py-2 rounded-md font-medium"
            >
              {currState === "Sign up" ? "Sign Up" : "Login"}
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <p>Agree to the terms of use & privacy policy.</p>
            </div>
          </>
        )}

        {isDataSubmitted && (
          <motion.div
            className="flex flex-col gap-3"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <p className="text-green-300 text-center">
              🎉 Data submitted successfully!
            </p>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us something about yourself..."
              rows="4"
              className="p-2 border border-gray-500 rounded-md bg-transparent text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <p>Agree to the terms of use & privacy policy.</p>
            </div>

            <button
              type="button"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition mt-2"
              onClick={handleCreateAccount}
            >
              Create Account
            </button>
          </motion.div>
        )}

        <p className="text-sm text-center">
          {currState === "Login" ? (
            <>
              Don’t have an account?{" "}
              <span
                onClick={toggleForm}
                className="text-blue-400 hover:underline cursor-pointer"
              >
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={toggleForm}
                className="text-blue-400 hover:underline cursor-pointer"
              >
                Login
              </span>
            </>
          )}
        </p>
      </motion.form>
    </div>
  );
};

export default LoginPage;
