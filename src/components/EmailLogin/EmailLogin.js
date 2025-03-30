// src/components/GoogleLogin.js
import React from "react";
import { auth, GoogleAuthProvider, signInWithPopup } from "../../firebase";
import { FcGoogle } from "react-icons/fc";
import './EmailLogin'

const GoogleLogin = () => {
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      alert("Logged in with Google successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <button className="google-login-button" onClick={handleGoogleLogin}>
      <FcGoogle className="google-icon" /> Login with Google
    </button>
  );
};

export default GoogleLogin;