import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PiShoppingCartThin } from "react-icons/pi";
import { CiSearch, CiHeart } from "react-icons/ci";
import { VscAccount } from "react-icons/vsc";
import { backendAPI } from "../../endpoint";
import axios from "axios";

const Header = () => {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

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

          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/wishlist")}
          >
            <CiHeart className="text-2xl text-black transition-colors hover:text-gray-800" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {wishlistCount}
            </span>
          </div>

          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/cart")}
          >
            <PiShoppingCartThin className="text-2xl text-black transition-colors hover:text-gray-800" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {cartCount}
            </span>
          </div>

          <div>
            <VscAccount
              className="text-3xl text-gray transition-colors hover:text-gray-800 cursor-pointer"
              onClick={() => navigate("/my-account")}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
