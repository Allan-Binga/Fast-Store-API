import React, { useState, useEffect } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { CiHeart, CiShoppingCart } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { backendAPI } from "../../endpoint";
import axios from "axios";

const PRODUCTS_ALLOWED = 4;

const NewArrivals = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [startIndex, setStartIndex] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getNewArrivals();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const visibleProducts = products.slice(
    startIndex,
    startIndex + PRODUCTS_ALLOWED
  );

  const handleNext = () => {
    if (startIndex + PRODUCTS_ALLOWED < products.length) {
      setStartIndex((prevIndex) => prevIndex + PRODUCTS_ALLOWED);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex((prevIndex) => prevIndex - PRODUCTS_ALLOWED);
    }
  };

  //Fetching new arrivals
  const getNewArrivals = async () => {
    try {
      const response = await axios.get(
        `${backendAPI}/api/products/new-arrivals`
      );
      return response.data;
    } catch (error) {
      throw error.response.data.message;
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 relative ml-[150px] mt-[35px]">
      {/* Flash Sales Header */}
      <div className="flex items-center gap-4">
        <div className="w-5">
          <div className="h-10 bg-blue-500" />
        </div>
        <div className="font-semibold text-secondary-2 text-[16px] tracking-[0.02em] leading-[1.5]">
          Past Month
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="text-text-2 font-semibold text-[36px] tracking-[0.02em] leading-[1.2]">
          New Arrivals
        </div>
        <div className="flex items-center gap-4 mr-[120px]">
          <FaArrowLeft
            className={`w-9 h-9 p-2 bg-gray-200 text-black rounded-full cursor-pointer ${
              startIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePrev}
          />
          <FaArrowRight
            className={`w-9 h-9 p-2 bg-gray-200 text-black rounded-full cursor-pointer ${
              startIndex + PRODUCTS_ALLOWED >= products.length
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={handleNext}
          />
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-4 gap-6 mt-6 mr-20">
        {visibleProducts.map((product) => (
          <div
            key={product._id}
            className="relative flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group"
          >
            {/* Discount Badge */}
            <div className="absolute top-4 left-4 bg-red-400 text-white text-sm font-bold py-1 px-2 rounded">
             -{product.discount}%
            </div>
            {/* Heart Icon */}
            <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full text-black hover:bg-blue-500 cursor-pointer">
              <CiHeart className="text-3xl" />
            </div>

            {/* Shopping Cart Icon */}
            <div className="absolute top-16 right-4 flex items-center justify-center w-10 h-10 rounded-full text-black hover:bg-blue-500 cursor-pointer">
              <CiShoppingCart
                onClick={() => navigate("/cart")}
                className="text-3xl"
              />
            </div>

            {/* Product Image */}
            <div className="w-[400px] h-[300px]  flex items-center justify-center overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="object-contain max-h-full max-w-full"
              />
            </div>
            {/* Product Details */}
            <div className="p-4 flex flex-col gap-2 mt-auto">
              <h3 className="text-lg font-bold text-gray-800">
                {product.name}
              </h3>
              <div className="text-sm text-blue-600 font-bold">
                ${product.currentPrice}{" "}
                <span className="text-gray-500 line-through">
                 $ {product.originalPrice}
                </span>
              </div>
              <div className="flex items-center text-sm text-yellow-500">
                {"★".repeat(Math.floor(product.reviews.rate))}
                {"☆".repeat(5 - Math.floor(product.reviews.rate))}
                <span className="ml-2 text-gray-500">
                  ({product.reviews.count} reviews)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewArrivals;
