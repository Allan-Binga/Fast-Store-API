import React, { useState, useEffect } from "react";
import { getProducts } from "../../api/products.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./products.css";
import Navbar from "../../components/navbar/Navbar.jsx";
import Footer from "../../components/footer/Footer.jsx";
import Bar from "../../components/categoriesBar/bar.jsx";

const Products = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        toast.error(`Error fetching products: ${error.message}`);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (id) => {
    navigate(`/products/${id}`);
  };

  return (
    <div className="page-container">
      <Navbar />
      <Bar />
      <div className="content-wrapper">
        <div className="content">
          <h1 className="products-title">Products</h1>
          {products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => (
                <div
                  className="product-card"
                  key={product._id}
                  onClick={() => handleProductClick(product._id)}
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="product-image"
                  />
                  <h2 className="product-title">{product.title}</h2>
                  <p className="product-price">
                    <strong>Price:</strong> ${product.price}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No products available.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
