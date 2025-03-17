import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { backendAPI } from "../../endpoint";
import axios from "axios";
import toast from "react-hot-toast";
import Footer from "../../components/footer/Footer";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";

const CategoryProducts = () => {
  const { category } = useParams(); // Get category from URL
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const response = await axios.get(
          `${backendAPI}/api/categories/${category}`
        );
        setCategoryProducts(response.data);
      } catch (error) {
        console.error("Error fetching category products:", error);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [category]); // Runs when `category` changes

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopHeader />
      <Header />

      {/* Main Content */}
      <div className="flex-grow container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-6">
            <div className="h-10 bg-blue-500" />
          </div>
          <h1 className="font-semibold text-secondary-2 text-[46px] tracking-[0.02em] leading-[1.5] capitalize">
            {category}
          </h1>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white shadow-md rounded-lg p-4"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded"
                />
                <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
                <p className="text-gray-500">{product.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg font-bold text-green-600">
                    ${product.currentPrice}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ${product.originalPrice}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">
            No products found in this category.
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoryProducts;
