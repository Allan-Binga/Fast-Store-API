import React from "react";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import { FaXTwitter, FaRegCopyright } from "react-icons/fa6";
import { IoSendOutline } from "react-icons/io5";
import AppStore from "./appstore.png";
import GooglePlay from "./playstore.png";
import QrCode from "./qrcode.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-blue-950 text-white py-10 px-5 font-sans">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between gap-8">
        {/* Fast Store Section */}
        <div className="w-full sm:w-1/2 md:w-1/4">
          <h3 className="text-xl font-semibold mb-4">Fast Store</h3>
          <div>
            <h4 className="text-lg font-medium">Subscribe</h4>
            <p className="text-sm mb-3">Get 10% off your first order</p>
            <div className="flex border border-white rounded overflow-hidden">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-2/3 p-2 bg-transparent text-white placeholder-gray-400 focus:outline-none"
              />
              <button className="w-1/3 bg-white text-black flex justify-center items-center">
                <IoSendOutline size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="w-full sm:w-1/2 md:w-1/4">
          <h3 className="text-xl font-semibold mb-4">Support</h3>
          <p className="text-sm">Nairobi, Kenya</p>
          <p className="text-sm">devbinga@gmail.com</p>
          <p className="text-sm">+254-712519615</p>
        </div>

        {/* Account Section */}
        <div className="w-full sm:w-1/2 md:w-1/4">
          <h3 className="text-xl font-semibold mb-4">Account</h3>
          <div className="flex flex-col space-y-2">
            <Link to="/signup">Register</Link>
            <Link to="/login">Login</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/wishlist">Wishlist</Link>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="w-full sm:w-1/2 md:w-1/4">
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <div className="flex flex-col space-y-2">
            <Link to="/policy">Privacy Policy</Link>
            <Link to="/terms">Terms Of Use</Link>
            <Link to="/faq">FAQs</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        {/* Download App Section */}
        <div className="w-full md:w-1/4">
          <h3 className="text-xl font-semibold mb-4">Download App</h3>
          <p className="text-sm mb-3">Save $3 with App. New User Only</p>
          <div className="flex items-center space-x-3">
            <img src={QrCode} alt="QR Code" className="w-16 h-16" />
            <div className="flex flex-col space-y-2">
              <img src={GooglePlay} alt="Google Play" className="w-24" />
              <img src={AppStore} alt="App Store" className="w-24" />
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <FaFacebook className="text-xl" />
            <FaXTwitter className="text-xl" />
            <FaInstagram className="text-xl" />
            <FaLinkedin className="text-xl" />
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="text-center border-t border-gray-700 mt-6 pt-4 flex justify-center items-center">
        <FaRegCopyright className="mr-2 text-sm" />
        <p className="text-sm">© 2025 FastStore. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
