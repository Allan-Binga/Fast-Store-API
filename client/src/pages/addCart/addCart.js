import React, { useState } from "react";
import toast from "react-hot-toast";
import { addCart } from "../../api/carts";
import { useNavigate } from "react-router-dom";
import "./cart.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

const AddCart = () => {
  const [newCart, setNewCart] = useState({
    userId: "",
    totalItems: "",
  });

  //NAVIGATE TO CARTS PAGE
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewCart({ ...newCart, [name]: value });
  };

  const handleAddCart = async (e) => {
    e.preventDefault();

    try {
      await addCart(newCart);
      toast.success("Cart added successfully.");
      navigate("/carts");
    } catch (error) {
      toast.error("Error adding cart.");
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };
  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        <div className="add-cart-container">
          <h1 className="add-cart-id">Add Cart</h1>
          <form className="add-cart-form" onSubmit={handleAddCart}>
            <input
              className="form-input"
              type="number"
              name="userId"
              placeholder="User-Id"
              value={newCart.userId}
              onChange={handleChange}
              required
            />
            <input
              className="form-input"
              type="number"
              name="totalItems"
              placeholder="Total Items"
              value={newCart.totalItems}
              onChange={handleChange}
              required
            />
            <div className="button-container">
              <button className="form-button" type="submit">
                Add Cart
              </button>
              <button
                className="cancel-button"
                type="button"
                onClick={handleBackClick}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddCart;
