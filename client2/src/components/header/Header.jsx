import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PiShoppingCartThin } from "react-icons/pi";
import { CiSearch, CiHeart } from "react-icons/ci";
import { VscAccount } from "react-icons/vsc";
import { backendAPI } from "../../endpoint";
import axios from "axios";
import { toast } from "react-hot-toast";

const Header = () => {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

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
            onClick={() => navigate("/orders")}
          >
            Orders
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
            <VscAccount
              className="text-3xl text-gray cursor-pointer"
              onClick={() => navigate("/my-account")}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
