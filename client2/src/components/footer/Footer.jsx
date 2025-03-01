import React from "react";
import "./footer.css";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import { FaXTwitter, FaRegCopyright } from "react-icons/fa6";
import { IoSendOutline } from "react-icons/io5";
import AppStore from "./appstore.png";
import GooglePlay from "./playstore.png";
import QrCode from "./qrcode.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section exclusive">
          <h3 className="section-title">Fast Store</h3>
          <div className="subscribe">
            <h4>Subscribe</h4>
            <p>Get 10% off your first order</p>
            <div className="subscribe-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="email-input"
              />
              <button className="subscribe-btn">
                <IoSendOutline />
              </button>
            </div>
          </div>
        </div>

        <div className="footer-section support">
          <h3 className="section-title">Support</h3>
          <p>Nairobi, Kenya</p>
          <p>devbinga@gmail.com</p>
          <p>+254-712519615</p>
        </div>

        <div className="footer-section account">
          <h3 className="section-title">Account</h3>
          <p>My Account</p>
          <p>Login / Register</p>
          <p>Cart</p>
          <p>Wishlist</p>
          <p>Shop</p>
        </div>

        <div className="footer-section quick-link">
          <h3 className="section-title">Quick Links</h3>
          <p>Privacy Policy</p>
          <p>Terms Of Use</p>
          <p>FAQ</p>
          <p>Contact</p>
        </div>

        <div className="footer-section download-app">
          <h3 className="section-title">Download App</h3>
          <p>Save $3 with App. New User Only</p>
          <div className="app-download">
            <img src={QrCode} alt="QR Code" className="qr-code" />
            <div className="store-icons">
              <img src={GooglePlay} alt="Google Play" className="google-play" />
              <img src={AppStore} alt="App Store" className="app-store" />
            </div>
          </div>
          <div className="social-icons">
            <FaFacebook className="social-icon" />
            <FaXTwitter className="social-icon" />
            <FaInstagram className="social-icon" />
            <FaLinkedin className="social-icon" />
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <FaRegCopyright className="copyright-icon" />
        <p className="copyright-text">Fast Store 2025. All right reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
