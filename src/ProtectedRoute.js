// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "./firebase";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  if (!auth.currentUser) {
    return <Navigate to="/signup/Login" />;
  }
  
  // Check for admin access if route requires it
  if (adminOnly && auth.currentUser.email !== "99220041116@klu.ac.in") {
    return <Navigate to="/Home" />;
  }
  
  return children;
};

export default ProtectedRoute;