import React from "react";
import "./header.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { PiShoppingCartThin } from "react-icons/pi";
import { CiSearch, CiHeart } from "react-icons/ci";

const Header = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <header className="header-container">
      <div className="header-content">
        <div className="logo" onClick={() => navigate("/")}>
          FASTSTORE
        </div>
        <nav className="header-links">
          <span className="header-link" onClick={() => navigate("/")}>
            Home
          </span>
          <span className="header-link" onClick={() => navigate("/contact")}>
            Contact
          </span>
          <span className="header-link" onClick={() => navigate("/about")}>
            About
          </span>
          <span className="header-link" onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </nav>
        <div className="header-actions">
          <div className="search-bar">
            <input type="text" placeholder="What are you looking for?" />
            <button className="search-button">
              <CiSearch />
            </button>
          </div>
          <CiHeart className="icon wishlist-icon" />
          <PiShoppingCartThin className="icon cart-icon" />
        </div>
      </div>
    </header>
  );
};

export default Header;
