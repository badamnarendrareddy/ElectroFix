import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "../../firebase";
import ImageSlider from "../ImageSlider";
import { FaEnvelope, FaLock, FaUser, FaPhone, FaGlobe } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import "./index.css";

const LoginSignup = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignup) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created successfully!");
        navigate("/Home");
      } catch (error) {
        setError(error.message);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Logged in successfully!");
        navigate("/Home");
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      alert("Logged in with Google successfully!");
      navigate("/Home");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-signup-container">
      <div className="login-details">
        <h1>{isSignup ? "Create an Account" : "Welcome Back!"}</h1>
        <p>{isSignup ? "Sign up to get started" : "Login or Signup to continue"}</p>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {isSignup && (
            <div className="input-group">
              <div className="country-code">
                <FaGlobe className="input-icon" />
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <option value="US">US (+1)</option>
                  <option value="IN">IN (+91)</option>
                  <option value="GB">GB (+44)</option>
                </select>
              </div>
              <FaPhone className="input-icon" />
              <input
                type="text"
                placeholder="Enter Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          )}

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

          {isSignup && (
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="Re-enter Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>
          {error && <p className="error">{error}</p>}
        </form>

        <div className="or-divider">OR</div>
        <button className="google-login-button" onClick={handleGoogleLogin}>
          <FcGoogle className="google-icon" /> {isSignup ? "Sign up with Google" : "Login with Google"}
        </button>

        <p className="toggle-link">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <span onClick={() => setIsSignup(false)}>Login here</span>
            </>
          ) : (
            <>
              New user?{" "}
              <span onClick={() => setIsSignup(true)}>Sign up here</span>
            </>
          )}
        </p>
      </div>

      <div className="image-section">
        <ImageSlider/>
      </div>
    </div>
  );
};

export default LoginSignup;