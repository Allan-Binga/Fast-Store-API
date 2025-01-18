import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { PiShoppingCartThin } from "react-icons/pi";
import { CiSearch, CiHeart } from "react-icons/ci";
import { VscAccount } from "react-icons/vsc";

const Header = () => {
  const navigate = useNavigate(); // Initialize useNavigate

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
            onClick={() => navigate("/signup")}
          >
            Sign Up
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
          <CiHeart className="text-2xl cursor-pointer text-black transition-colors hover:text-gray-800" />
          <PiShoppingCartThin className="text-2xl cursor-pointer text-black transition-colors hover:text-gray-800" />
          <VscAccount className="text-2xl cursor-pointer text-black transition-colors hover:text-gray-800" />
        </div>
      </div>
    </header>
  );
};

export default Header;
