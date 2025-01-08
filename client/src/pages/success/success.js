import React from "react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import "./success.css";

const Success = () => {
  return (
    <div className="main">
      <Navbar />
      <div className="success-message">
        <h1>Thank you for shopping at Fast Store!</h1>
        <p>
          Your order has been successfully placed. We hope to serve you again
          soon!
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default Success;
