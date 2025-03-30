// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import LoginSignup from "./components/Login";
import ProductDetail from "./components/ProductDetails";
import Products from "./components/ProductListing";
import ServiceAgentRegistration from "./components/RegistrationFormS";
import Profile from "./components/Profile";
import ProtectedRoute from "./ProtectedRoute";
import RepairBooking from "./components/RepairBooking";
import RepairServices from "./components/RepairServices";
import ServiceBooking from "./components/RepairBooking";
import AdminPage from "./components/AdminDashboard";
import AddElectrician from "./components/AddElectrician";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/signup/Login" element={<LoginSignup />} />
        <Route path="/products" element={<Products/>} />
        <Route path="/product-detail" element={<ProductDetail />} />
        <Route path="/service-agent-registration" element={<ServiceAgentRegistration />} />
        <Route path="/book-service/:serviceId" element={<ServiceBooking />} />

        {/* Protected Routes */}
        <Route
          path="/Home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repair-services"
          element={
            <ProtectedRoute>
              <RepairServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repair-booking"
          element={
            <ProtectedRoute>
              <RepairBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Only Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-electrician"
          element={
            <ProtectedRoute adminOnly>
              <AddElectrician />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;