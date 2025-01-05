import React from "react";
import "./navbar.css";
import logo from "../navbar/logo.jpg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/auth";
import toast from "react-hot-toast";
import { FaCartShopping } from "react-icons/fa6";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/" ||
    location.pathname === "/logout";

  //LOGOUT HANDLING
  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Successfully logged out.");
      navigate("/");
    } catch (error) {
      toast("Error logging out.");
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="Store Logo" />
        <span>Fast StoreAPI</span>
      </div>
      {!isAuthPage && (
        <div className="nav-links">
          <Link to="/products/allcategories" className="nav-link">
            Categories
          </Link>
          <Link to="/products" className="nav-link">
            Products
          </Link>
          <Link to="/faststore/cart" className="nav-link">
            <FaCartShopping />
          </Link>
          <button className="logout-button" onClick={handleLogout}>
            LOGOUT
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
