import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { PiShoppingCartThin } from "react-icons/pi";
import { CiSearch, CiHeart } from "react-icons/ci";
import { VscAccount } from "react-icons/vsc";
import { FaRegBell } from "react-icons/fa";
import { backendAPI } from "../../endpoint";
import axios from "axios";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const Header = () => {
  const { id } = useParams();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Wishlist useEffect
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axios.get(`${backendAPI}/api/wishlist/user`, {
          withCredentials: true,
        });
        setWishlistCount(response.data.products.length || 0);
      } catch (error) {
        console.error("Error fetching wishlist");
      }
    };
    fetchWishlist();
  }, []);

  // Cart useEffect
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`${backendAPI}/api/cart/user`, {
          withCredentials: true,
        });
        setCartCount(response.data.products.length || 0);
      } catch (error) {
        console.error("Error fetching cart products.");
      }
    };
    fetchCart();
  }, []);

  //Notification useEffect
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${backendAPI}/api/notifications/user`,
          { withCredentials: true }
        );
        if (Array.isArray(response.data)) {
          setNotifications(response.data);
          setNotificationCount(response.data.filter((n) => !n.read).length);
        } else {
          setNotifications([]);
          setNotificationCount(0);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();
  }, [id]);

  // Search engine useEffect
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }
      try {
        const response = await axios.get(
          `${backendAPI}/api/products/search?q=${encodeURIComponent(
            searchQuery
          )}`
        );
        setSearchResults(response.data);
        setShowDropdown(true);
      } catch (error) {
        toast.error("Error searching products.");
      }
    };
    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle clicks outside the notification and profile dropdowns.
  useEffect(() => {
    const handleClickOutside = (event) => {
      //Profile Icon
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }

      //Notification Bell
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //Loggin session useEffect
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await axios.get(`${backendAPI}/api/auth/check-session`, {
          withCredentials: true,
        });
        setIsLoggedIn(res.data.isLoggedIn);
      } catch (err) {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  //Dropdown menu handling
  const handleAccountClick = () => {
    setShowDropdown((prev) => !prev); // Toggle dropdown visibility
  };

  //Logout handling
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${backendAPI}/api/auth/logout`,
        {},
        { withCredentials: true } // This ensures cookies are sent with the request
      );
      if (response.status === 200) {
        document.cookie = "storeSession=; Max-Age=0; path=/;";
        toast.success("Successfully logged out.");
      } else {
        toast.error("You are not logged in.");
      }
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("You are not logged in.");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-2 px-5 font-sans">
      <div className="flex justify-between items-center max-w-screen-xl mx-auto">
        <div
          className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 cursor-pointer hover:scale-105 hover:animate-pulse transition-all duration-300"
          onClick={() => navigate("/")}
        >
          FASTSTORE
        </div>

        <nav className="flex gap-7">
          <span
            className={`text-base text-black cursor-pointer hover:font-bold hover:border-b-2 hover:border-black ${
              location.pathname === "/"
                ? "font-bold border-b-2 border-black"
                : ""
            }`}
            onClick={() => navigate("/")}
          >
            Home
          </span>
          <span
            className={`text-base text-black cursor-pointer hover:font-bold hover:border-b-2 hover:border-black ${
              location.pathname === "/contact"
                ? "font-bold border-b-2 border-black"
                : ""
            }`}
            onClick={() => navigate("/contact")}
          >
            Contact
          </span>
          <span
            className={`text-base text-black cursor-pointer hover:font-bold hover:border-b-2 hover:border-black ${
              location.pathname === "/about"
                ? "font-bold border-b-2 border-black"
                : ""
            }`}
            onClick={() => navigate("/about")}
          >
            About
          </span>
          <span
            className={`text-base text-black cursor-pointer hover:font-bold hover:border-b-2 hover:border-black ${
              location.pathname === "/orders"
                ? "font-bold border-b-2 border-black"
                : ""
            }`}
            onClick={() => navigate("/orders")}
          >
            Orders
          </span>
          {!isLoggedIn && (
            <>
              <span
                className={`text-base text-black cursor-pointer hover:font-bold hover:border-b-2 hover:border-black ${
                  location.pathname === "/signup"
                    ? "font-bold border-b-2 border-black"
                    : ""
                }`}
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </span>
              <span
                className={`text-base text-black cursor-pointer hover:font-bold hover:border-b-2 hover:border-black ${
                  location.pathname === "/login"
                    ? "font-bold border-b-2 border-black"
                    : ""
                }`}
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </>
          )}
        </nav>

        <div className="flex items-center gap-5 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="border border-gray-200 rounded-lg px-3 py-2 w-72 outline-none text-sm bg-gray-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <CiSearch className="absolute right-2 top-3 text-gray-600 cursor-pointer" />
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 w-72 bg-white border border-gray-200 shadow-lg rounded-lg mt-1 z-10">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      navigate(`/products/${item._id}`);
                      setShowDropdown(false);
                      setSearchQuery("");
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/wishlist")}
          >
            <CiHeart className="text-2xl text-black" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {wishlistCount}
            </span>
          </div>
          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/cart")}
          >
            <PiShoppingCartThin className="text-2xl text-black" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {cartCount}
            </span>
          </div>
          <div>
            <div
              className="relative cursor-pointer"
              onClick={handleAccountClick}
              ref={dropdownRef}
            >
              <VscAccount className="text-3xl text-gray" />
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-md rounded-md">
                  <ul>
                    <li
                      className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                      onClick={() => navigate("/my-orders")}
                    >
                      My Orders
                    </li>
                    <li
                      className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                      onClick={() => navigate("/addresses")}
                    >
                      Addresses
                    </li>
                    <li
                      className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                      onClick={() => navigate("/addresses")}
                    >
                      Account
                    </li>
                    <li
                      className="py-2 px-4 hover:bg-red-300 cursor-pointer"
                      onClick={handleLogout}
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div
            className="relative cursor-pointer"
            onClick={() => setShowNotifications((prev) => !prev)}
            ref={notificationDropdownRef}
          >
            <FaRegBell className="text-2xl text-black" />
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {notificationCount}
              </span>
            )}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 shadow-lg rounded-md z-20 max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((note) => (
                    <div
                      key={note._id}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-100 cursor-pointer ${
                        note.read ? "text-gray-600" : "font-semibold text-black"
                      }`}
                      onClick={() => {
                        // Optional: Mark notification as read, redirect, etc.
                        console.log("Notification clicked:", note.message);
                      }}
                    >
                      <p className="text-sm">{note.message}</p>
                      <p className="text-xs text-gray-400">
                        {dayjs(note.createdAt).fromNow()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-sm">
                    No notifications
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
