import React from "react";
import "./checkout.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import Bar from "../../components/categoriesBar/bar";

const Checkout = () => {
  return (
    <div className="page-container">
      <Navbar />
      <Bar />
      <Footer />
    </div>
  );
};

export default Checkout;
