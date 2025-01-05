import React from "react";
import { Link } from "react-router-dom";
import "./home.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import Bar from "../../components/categoriesBar/bar";

const Home = () => {
  return (
    <div className="page-container">
      <Navbar />
      <Bar/>
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
