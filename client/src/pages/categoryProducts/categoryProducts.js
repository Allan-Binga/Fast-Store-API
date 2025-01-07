import React, { useEffect, useState } from "react";
import { getProductsInACategory } from "../../api/categories";
import "./categoryProducts.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import Bar from "../../components/categoriesBar/bar";
import Spinner from "../../components/spinner/spinner";

const CategoryProduct = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true); // Show spinner
        const productsData = await getProductsInACategory(category);
        setProducts(productsData);
      } catch (error) {
        toast.error("Error fetching products from this category.");
      } finally {
        setIsLoading(false); // Hide spinner
      }
    };

    fetchProducts();
  }, [category]);

  return (
    <div className="page-container-cat">
      <Navbar />
      <Bar />
      <div className="content-wrapper-cat">
        <div className="content-cat">
          <h1 className="products-title-cat">{category}</h1>
          {isLoading ? (
            <Spinner /> // Show the spinner while loading
          ) : products.length > 0 ? (
            <div className="products-grid-cat">
              {products.map((product) => (
                <div key={product._id} className="product-card-cat">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="product-image-cat"
                  />
                  <h2 className="product-title-cat">{product.title}</h2>
                  <p className="product-price-cat">${product.price}</p>
                  <p className="product-description-cat">
                    {product.description}
                  </p>
                  <p className="product-rating-cat">
                    Rating: {product.rating.rate} ({product.rating.count}{" "}
                    reviews)
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No products found in this category.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryProduct;
