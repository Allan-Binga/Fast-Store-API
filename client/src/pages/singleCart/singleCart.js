import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { getCartById, deleteCart } from "../../api/carts";
import toast from "react-hot-toast";
import "./cart.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

Modal.setAppElement("#root");

const SingleCart = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartData = await getCartById(id);
        setCart(cartData);
      } catch (error) {
        toast.error("Error fetching cart");
        setCart(null);
      }
    };

    fetchCart();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteCart(id);
      toast.success("Product deleted successfully");
      navigate("/carts"); // Redirect to product list or another route
    } catch (error) {
      toast.error(error.message || "Failed to delete cart");
    }
  };

  const handleUpdateCartClick = (id) => {
    navigate(`/carts/update/${id}`);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (cart === null) return null;
  if (!cart) return <p>Product not found.</p>;

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        <div className="single-cart-container">
          <button className="back-button" onClick={handleBackClick}>
            &larr; Back
          </button>
          <h1 className="single-cart-id">Cart-ID:{cart._id}</h1>
          <div className="single-cart-details">
            <div className="single-cart-info">
              <p>
                <strong>Total Items:</strong>
                <b>{cart.totalItems} </b>
              </p>
              <div className="cart-actions">
                <button
                  className="delete-button"
                  onClick={() => setIsModalOpen(true)}
                >
                  Delete Cart
                </button>
                <button
                  className="update-button"
                  key={cart._id}
                  onClick={() => handleUpdateCartClick(cart._id)}
                  style={{ cursor: "pointer" }}
                >
                  Update Cart
                </button>
              </div>
            </div>
          </div>
          <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            className="modal-content"
            overlayClassName="modal-overlay"
          >
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this cart?</p>
            <div className="modal-buttons">
              <button
                className="cancel-button"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-button"
                onClick={() => {
                  handleDelete();
                  setIsModalOpen(false);
                }}
              >
                Delete
              </button>
            </div>
          </Modal>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SingleCart;
