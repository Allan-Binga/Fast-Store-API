import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../api/products";
import toast from "react-hot-toast";
import "./single.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

const SingleProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductById(id);
        setProduct(productData);
      } catch (error) {
        toast.error("Error fetching product");
        setProduct(null);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdateProductClick = (id) => {
    navigate(`/products/update/${id}`);
  };

  const handleBackClick = () => {
    navigate(-1); //Previous page
  };

  if (product === null) return null;
  if (!product) return <p>Product not found.</p>;

  return (
    <div>
      <Navbar />
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
                className="update-button"
                key={product._id}
                onClick={() => handleUpdateProductClick(product._id)}
                style={{ cursor: "pointer" }}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SingleProduct;
