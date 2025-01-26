import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PiShoppingCartThin } from "react-icons/pi";
import { CiSearch, CiHeart } from "react-icons/ci";
import { VscAccount } from "react-icons/vsc";
import { backendAPI } from "../../endpoint";
import toast from "react-hot-toast";
import axios from "axios";

const Header = () => {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const toggleCard = () => {
    setIsCardVisible((prev) => !prev);
  };

  //LOGOUT HANDLING
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${backendAPI}/api/auth/logout`,
        {},
        { withCredentials: true } // This ensures cookies are sent with the request
      );

      if (response.status === 200) {
        // Server confirms logout, we can now safely clear the cookie
        document.cookie = "storeSession=; Max-Age=0; path=/;";
        toast.success("Successfully logged out.");
        // Optionally, redirect or update UI state here
      } else {
        // If the server tells us no user is logged in or another error
        toast.error("You are not logged in.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("You are not logged in.");
    }
  };

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsCardVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (path) => {
    navigate(path);
    setIsCardVisible(false); // Close the card after navigation
  };

  return (
    <header className="bg-white border-b border-gray-200 py-2 px-5 font-sans">
      <div className="flex justify-between items-center max-w-screen-xl mx-auto">
        {/* Logo */}
        <div
          className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 cursor-pointer hover:scale-105 hover:animate-pulse transition-all duration-300"
          onClick={() => navigate("/")}
        >
          FASTSTORE
        </div>

        {/* Navigation */}
        <nav className="flex gap-7">
          <span
            className="text-base text-black cursor-pointer hover:font-bold hover:border-b-2 hover:border-black"
            onClick={() => navigate("/")}
          >
            Home
          </span>
          <span
            className="text-base text-black cursor-pointer hover:font-bold hover:border-b-2 hover:border-black"
            onClick={() => navigate("/contact")}
          >
            Contact
          </span>
          <span
            className="text-base text-black cursor-pointer hover:font-bold hover:border-b-2 hover:border-black"
            onClick={() => navigate("/about")}
          >
            About
          </span>
          <span
            className="text-base text-black cursor-pointer hover:font-bold hover:border-b-2 hover:border-black"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
          <span
            className="text-base text-black cursor-pointer hover:font-bold hover:border-b-2 hover:border-black"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 px-3 py-2">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="border-none outline-none text-sm bg-transparent w-40 py-1"
            />
            <button className="bg-transparent border-none p-2 text-gray-700 cursor-pointer hover:text-black">
              <CiSearch />
            </button>
          </div>
          <CiHeart
            className="text-2xl cursor-pointer text-black transition-colors hover:text-gray-800"
            onClick={() => navigate("/wishlist")}
          />
          <PiShoppingCartThin
            className="text-2xl cursor-pointer text-black transition-colors hover:text-gray-800"
            onClick={() => navigate("/cart")}
          />
          <div className="relative">
            {/* Account Icon */}
            <VscAccount
              className="text-2xl cursor-pointer text-black transition-colors hover:text-gray-800"
              onClick={toggleCard}
            />

            {/* Dropdown Card */}
            {isCardVisible && (
              <div
                ref={cardRef}
                className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md p-4 border border-gray-200 z-50"
              >
                <button
                  className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 p-2 rounded"
                  onClick={() => handleOptionClick("/my-orders")}
                >
                  My Orders
                </button>
                <button
                  className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 p-2 rounded"
                  onClick={() => handleOptionClick("/account-settings")}
                >
                  Account Settings
                </button>
                <button
                  className="w-full text-left text-sm text-red-500 hover:bg-red-100 p-2 rounded"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
