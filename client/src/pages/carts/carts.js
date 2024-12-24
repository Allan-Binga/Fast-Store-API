import React, { useState, useEffect } from "react";
import { getCarts } from "../../api/carts";
import "./carts.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Carts = () => {
  const [carts, setCarts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const cartsData = await getCarts();
        setCarts(cartsData);
      } catch (error) {
        toast.error("Error fetching carts.");
      }
    };

    fetchCarts();
  }, []);

  const handleCartClick = (id) => {
    navigate(`/carts/${id}`);
  };
  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        <div className="carts-container">
          <h1 className="carts-id">Carts</h1>
          <button
            className="add-cart-button"
            onClick={() => navigate("/carts/add")}
          >
            Add Cart
          </button>
          <div className="carts-grid">
            {carts.map((cart) => (
              <div
                className="cart-card"
                key={cart._id}
                onClick={() => handleCartClick(cart._id)}
                style={{ cursor: "pointer" }}
              >
                <h2 className="cart-id">Cart ID:{cart._id}</h2>
                <p className="total-items">
                  <strong>Total Items:</strong>
                  {cart.totalItems}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Carts;
