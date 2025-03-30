// src/components/EmailPhoneLogin.js
import React, { useState } from "react";
import { auth, signInWithEmailAndPassword } from "../../firebase";
import { FaEnvelope, FaPhone, FaLock } from "react-icons/fa";
import 'react-phone-number-input/style.css';

import './index.css';

const EmailPhoneLogin = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Check if the input is a phone number or email
      const isPhoneNumber = /^\+[1-9]{1}[0-9]{3,14}$/.test(emailOrPhone);

      if (isPhoneNumber) {
        // Handle phone number login (if needed)
        setError("Phone number login is not supported yet.");
      } else {
        // Handle email login
        await signInWithEmailAndPassword(auth, emailOrPhone, password);
        alert("Logged in successfully!");
        window.location.href = "/home"; // Redirect to home page
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="input-group">
        {/^\+[1-9]{1}[0-9]{3,14}$/.test(emailOrPhone) ? (
          <FaPhone className="input-icon" />
        ) : (
          <FaEnvelope className="input-icon" />
        )}
        <input
          type="text"
          placeholder="Enter Email or Phone Number"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <FaLock className="input-icon" />
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Login</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default EmailPhoneLogin;