import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import './index.css';
import {
  FaUser,
  FaIdCard,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaSearch,
  FaPlus,
  FaBox,
  FaHeart,
  FaGift,
  FaTools,
  FaSignOutAlt,
  FaSignInAlt
} from "react-icons/fa";
import { auth } from "../../firebase";

const Navbar = () => {
  const [isLoginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setIsLoggedIn(true);
        if (user.email === "99220041116@klu.ac.in") {
          setIsAdmin(true);
          document.querySelector('.navbar').classList.add('admin-mode');
        } else {
          setIsAdmin(false);
          document.querySelector('.navbar').classList.remove('admin-mode');
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        document.querySelector('.navbar').classList.remove('admin-mode');
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleLoginDropdown = () => setLoginDropdownOpen(!isLoginDropdownOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsLoggedIn(false);
      setLoginDropdownOpen(false);
      navigate("/signup/Login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">
        <Link to="/Home">MyStore</Link>
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Nav Links */}
      <ul className={`nav-links ${isMobileMenuOpen ? "active" : ""}`}>
        {/* Search Bar */}
        <li className="search-bar">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search for products or brands" />
        </li>

        {/* Login Dropdown or Logout Button */}
        {isLoggedIn ? (
          <li className="dropdown">
            <div 
              className="nav-link" 
              onClick={toggleLoginDropdown}
              style={{ cursor: 'pointer' }}
            >
              <FaUser /> My Account
            </div>
            {isLoginDropdownOpen && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/profile">
                    <FaUser /> My Profile
                  </Link>
                </li>
                <li>
                  <Link to="/orders">
                    <FaBox /> Orders
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist">
                    <FaHeart /> Wishlist
                  </Link>
                </li>
                <li className="divider"></li>
                <li>
                  <button onClick={handleLogout} className="logout-button">
                    <FaSignOutAlt /> Logout
                  </button>
                </li>
              </ul>
            )}
          </li>
        ) : (
          <li className="dropdown">
            <div 
              className="nav-link" 
              onClick={toggleLoginDropdown}
              style={{ cursor: 'pointer' }}
            >
              <FaSignInAlt /> Login
            </div>
            {isLoginDropdownOpen && (
              <ul className="dropdown-menu">
                <li className="signup-option">
                  <span>New User?</span>
                  <Link to="/signup/Login" onClick={() => setLoginDropdownOpen(false)}>
                    <FaPlus /> Sign Up
                  </Link>
                </li>
                <li className="divider"></li>
                <li>
                  <Link to="/profile" onClick={() => setLoginDropdownOpen(false)}>
                    <FaUser /> My Profile
                  </Link>
                </li>
                <li>
                  <Link to="/e-service" onClick={() => setLoginDropdownOpen(false)}>
                    <FaTools /> E-Service Plus Zone
                  </Link>
                </li>
                <li>
                  <Link to="/orders" onClick={() => setLoginDropdownOpen(false)}>
                    <FaBox /> Orders
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" onClick={() => setLoginDropdownOpen(false)}>
                    <FaHeart /> Wishlist
                  </Link>
                </li>
                <li>
                  <Link to="/rewards" onClick={() => setLoginDropdownOpen(false)}>
                    <FaGift /> Rewards
                  </Link>
                </li>
                <li>
                  <Link to="/gift-cards" onClick={() => setLoginDropdownOpen(false)}>
                    <FaGift /> Gift Cards
                  </Link>
                </li>
              </ul>
            )}
          </li>
        )}

        {/* Repair Services */}
        <li>
          <Link to="/repair-services" className="nav-link">
            <FaTools /> Services
          </Link>
        </li>

        {/* Conditionally render Cart and ServiceAgent links for non-admin users */}
        {!isAdmin && (
          <>
            <li className="cart-link">
              <Link to="/cart" className="nav-link">
                <FaShoppingCart /> Cart <span className="cart-badge">3</span>
              </Link>
            </li>
            <li className="service-agent-link">
              <Link to="/service-agent-registration" className="nav-link">
                <FaIdCard /> Be ServiceAgent
              </Link>
            </li>
          </>
        )}

        {/* Conditionally render Admin link */}
        {isAdmin && (
          <li>
            <Link to="/admin" className="nav-link admin-link">
              <FaUser /> Admin
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;