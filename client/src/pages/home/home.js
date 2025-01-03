import React from "react";
import { Link } from "react-router-dom";
import "./home.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

const Home = () => {
  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        <div className="home-container">
          <h1 className="home-title">Welcome to Fast StoreAPI</h1>
          <p className="home-text">
            This is the main page. Please{" "}
            <Link to="/register" className="home-link">
              Register
            </Link>{" "}
            or{" "}
            <Link to="/login" className="home-link">
              Login
            </Link>{" "}
            to get started.
          </p>
           {/* Google Login Button */}
           <button className="google-login-btn">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Logo" className="google-logo" />
            Login with Google
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
