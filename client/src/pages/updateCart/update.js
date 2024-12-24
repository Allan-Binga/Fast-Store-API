import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateCart } from "../../api/carts";
import toast from "react-hot-toast";
import "./updateCart.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

const UpdateCart = () => {
  const [cart, setCart] = useState({
    userId: "",
    totalItems: "",
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;

    setCart({ ...cart, [name]: value });
  };

  const handleUpdateCart = async (e) => {
    e.preventDefault();

    try {
      await updateCart(id, cart);
      toast.success("Cart updated successfully.");
      navigate("/carts");
    } catch (error) {
      toast.error("Error updating product.");
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <Navbar />
        <div className="content">
          <div className="update-cart-container">
            <h1 className="update-cart-id">Update Cart</h1>
            <form className="update-cart-form" onSubmit={handleUpdateCart}>
              <input
                className="form-input"
                type="number"
                name="userId"
                placeholder="User-Id"
                value={cart.userId}
                onChange={handleChange}
                required
              />
              <input
                className="form-input"
                type="number"
                name="totalItems"
                placeholder="Total Items"
                value={cart.totalItems}
                onChange={handleChange}
                required
              />
              <div className="button-container">
                <button
                  className="cancel-button"
                  type="button"
                  onClick={handleBackClick}
                >
                  Cancel
                </button>
                <button className="update-button" type="submit">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UpdateCart;
