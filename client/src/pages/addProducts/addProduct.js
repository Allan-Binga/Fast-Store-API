import React, { useState } from "react";
import toast from "react-hot-toast";
import { addProduct } from "../../api/products.js";
import { useNavigate } from "react-router-dom";
import "./addProducts.css";
import Navbar from "../../components/navbar/Navbar.jsx";
import Footer from "../../components/footer/Footer.jsx";

const AddProduct = () => {
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    image: "",
    rating: { rate: 0, count: 0 },
  });

  // Navigate to products page
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "rate" || name === "count") {
      setNewProduct({
        ...newProduct,
        rating: { ...newProduct.rating, [name]: value },
      });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault(); // Prevent page refresh on form submission

    try {
      await addProduct(newProduct);
      toast.success("Product added successfully!");
      navigate("/products");
    } catch (error) {
      toast.error("Error adding product.");
    }
  };

  const handleBackClick = () => {
    navigate(-1); //Previous page
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        <div className="add-product-container">
          <h1 className="add-product-title">Add Product</h1>
          <form className="add-product-form" onSubmit={handleAddProduct}>
            <input
              className="form-input"
              type="text"
              name="title"
              placeholder="Title"
              value={newProduct.title}
              onChange={handleChange}
              required
            />
            <input
              className="form-input"
              type="number"
              name="price"
              placeholder="Price"
              value={newProduct.price}
              onChange={handleChange}
              required
            />
            <textarea
              className="form-textarea"
              name="description"
              placeholder="Description"
              value={newProduct.description}
              onChange={handleChange}
              required
            />
            <input
              className="form-input"
              type="text"
              name="category"
              placeholder="Category"
              value={newProduct.category}
              onChange={handleChange}
              required
            />
            <input
              className="form-input"
              type="text"
              name="image"
              placeholder="Image URL"
              value={newProduct.image}
              onChange={handleChange}
              required
            />
            <input
              className="form-input"
              type="number"
              name="rate"
              placeholder="Rating (Rate)"
              value={newProduct.rating.rate}
              onChange={handleChange}
              step="0.1"
            />
            <input
              className="form-input"
              type="number"
              name="count"
              placeholder="Rating (Count)"
              value={newProduct.rating.count}
              onChange={handleChange}
            />
            <div className="button-container">
              <button className="form-button" type="submit">
                Add Product
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

export default AddProduct;
