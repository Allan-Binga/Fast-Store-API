import React from "react";
import "./footer.css";
import { FaXTwitter, FaFacebookF, FaGithub } from "react-icons/fa6";
import Payment from "../payments/payment";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="social-media">
          <a
            href="https://x.com/B1nga__"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaXTwitter className="icon twitter" />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF className="icon facebook" />
          </a>
          <a
            href="https://github.com/Allan-Binga"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub />
          </a>
        </div>
        <div className="contact">
          <p>Contact us at: support@faststoreapi.com</p>
          <p>© 2024 Fast StoreAPI. All rights reserved.</p>
        </div>
        {/*PAYMENT SECTION*/}
        <div className="payment-methods">
          <p>Accepted Payment Methods:</p>
          <Payment />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
