import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateProduct } from "../../api/products";
import toast from "react-hot-toast";
import "./updateProduct.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

const UpdateProduct = () => {
  const [product, setProduct] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    image: "",
    rating: { rate: 0, count: 0 },
  });

  const { id } = useParams();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "rate" || name === "count") {
      setProduct({
        ...product,
        rating: { ...product.rating, [name]: value },
      });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault(); // Prevent page refresh

    try {
      await updateProduct(id, product);
      toast.success("Product updated successfully!");
      navigate("/products"); // Redirect to the products page
    } catch (error) {
      toast.error("Error updating product.");
    }
  };

  const handleBackClick = () => {
    navigate(-1); //Previous page
  };

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <Navbar />
        <div className="content">
          <div className="update-product-container">
            <h1 className="update-product-title">Update Product</h1>
            <form
              className="update-product-form"
              onSubmit={handleUpdateProduct}
            >
              <input
                className="form-input"
                type="text"
                name="title"
                placeholder="Title"
                value={product.title}
                onChange={handleChange}
                required
              />
              <input
                className="form-input"
                type="number"
                name="price"
                placeholder="Price"
                value={product.price}
                onChange={handleChange}
                required
              />
              <textarea
                className="form-textarea"
                name="description"
                placeholder="Description"
                value={product.description}
                onChange={handleChange}
                required
              />
              <input
                className="form-input"
                type="text"
                name="category"
                placeholder="Category"
                value={product.category}
                onChange={handleChange}
                required
              />
              <input
                className="form-input"
                type="text"
                name="image"
                placeholder="Image URL"
                value={product.image}
                onChange={handleChange}
                required
              />
              <input
                className="form-input"
                type="number"
                name="rate"
                placeholder="Rating (Rate)"
                value={product.rating.rate}
                onChange={handleChange}
                step="0.1"
              />
              <input
                className="form-input"
                type="number"
                name="count"
                placeholder="Rating (Count)"
                value={product.rating.count}
                onChange={handleChange}
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

export default UpdateProduct;
