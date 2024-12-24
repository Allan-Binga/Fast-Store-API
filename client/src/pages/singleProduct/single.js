import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { getProductById, deleteProduct } from "../../api/products";
import toast from "react-hot-toast";
import "./single.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

Modal.setAppElement("#root"); // Avoid accessibility issues by binding Modal to the root element

const SingleProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductById(id);
        setProduct(productData);
      } catch (error) {
        toast.error("Error fetching product");
        setProduct(null)
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteProduct(id); // Call deleteProduct API
      toast.success("Product deleted successfully");
      navigate("/products"); // Redirect to product list or another route
    } catch (error) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleUpdateProductClick = (id) => {
    navigate(`/products/update/${id}`)
  }

  const handleBackClick = () => {
    navigate(-1); //Previous page
  };

  if (product === null) return null; 
  if (!product) return <p>Product not found.</p>;

  return (
    <div>
    <Navbar/>
    <div className="single-product-container">
      <button className="back-button" onClick={handleBackClick}>
        &larr; Back
      </button>
      <h1 className="single-product-title">{product.title}</h1>
      <div className="single-product-details">
        <div className="single-product-image">
          <img src={product.image} alt={product.title} />
        </div>
        <div className="single-product-info">
          <p>
            <strong>Price:</strong> ${product.price}
          </p>
          <p>
            <strong>Category:</strong> {product.category}
          </p>
          <p>
            <strong>Description:</strong> {product.description}
          </p>
          <p>
            <strong>Rating:</strong> {product.rating?.rate} (
            {product.rating?.count} reviews)
          </p>
          <div className="product-actions">
            <button
              className="delete-button"
              onClick={() => setIsModalOpen(true)}
            >
              Delete Product
            </button>
            <button
              className="update-button"
              key={product._id}
              onClick={() => handleUpdateProductClick(product._id)}
              style={{ cursor: "pointer" }}
            >
              Update Product
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
        <p>Are you sure you want to delete this product?</p>
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
    <Footer/>
    </div>
  );
};

export default SingleProduct;
