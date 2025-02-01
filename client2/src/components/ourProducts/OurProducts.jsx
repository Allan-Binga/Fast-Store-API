import React, { useState, useEffect } from "react";
import { CiHeart, CiShoppingCart } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaStar, FaRegStar } from "react-icons/fa";
import { backendAPI } from "../../endpoint";
import toast from "react-hot-toast";

const OurProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  //FETCH OUR PRODUCTS FROM THE BACKEND
  const getProducts = async () => {
    try {
      const response = await axios.get(`${backendAPI}/api/products`);
      return response.data;
    } catch (error) {
      throw error.response.data.message;
    }
  };

  //useEffect FOR FETCHING ON COMPONENT MOUNT
  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  //REVIEWS SECTION STARS
  const renderStars = (rate) => {
    const fullStars = Math.floor(rate);
    const halfStars = rate % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;

    return (
      <>
        {Array(fullStars)
          .fill()
          .map((_, i) => (
            <FaStar key={`full-${i}`} className="text-yellow-500" />
          ))}
        {Array(halfStars)
          .fill()
          .map((_, i) => (
            <FaStar key={`half-${i}`} className="text-yellow-500 opacity-50" />
          ))}
        {Array(emptyStars)
          .fill()
          .map((_, i) => (
            <FaRegStar key={`empty-${i}`} className="text-gray-300" />
          ))}
      </>
    );
  };

  //HEART ICON FOR ADDING A PRODUCT TO WISHLIST
  const handleAddToWishlist = async (product) => {
    try {
      const response = await axios.post(
        `${backendAPI}/api/wishlist/add-to-wishlist`,
        product,
        {
          withCredentials: true, // Send cookies for authentication
        }
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 relative ml-[150px] mt-[35px]">
      {/* Our Products Header */}
      <div className="flex items-center gap-4">
        <div className="w-5">
          <div className="h-10 bg-blue-500" />
        </div>
        <div className="font-semibold text-secondary-2 text-[16px] tracking-[0.02em] leading-[1.5]">
          Our Products
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="text-text-2 font-semibold text-[36px] tracking-[0.02em] leading-[1.2]">
          Products
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-4 gap-6 mt-6 mr-20">
        {products.slice(0, 8).map((product) => (
          <div
            key={product._id}
            className="relative flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group"
          >
            {/* Discount Badge */}
            <div className="absolute top-4 left-4 bg-blue-400 text-white text-sm font-bold py-1 px-2 rounded">
              -{product.discount}%
            </div>
            {/* Heart Icon */}
            <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full text-black hover:bg-red-500 cursor-pointer">
              <CiHeart
                className="text-3xl"
                onClick={() => handleAddToWishlist(product)}
              />
            </div>
          
            {/* Shopping Cart Icon */}
            <div className="absolute top-16 right-4 flex items-center justify-center w-10 h-10 rounded-full text-black hover:bg-red-500 cursor-pointer">
              <CiShoppingCart
                onClick={() => navigate("/cart")}
                className="text-3xl"
              />
            </div>

            {/* Product Image */}
            <div className="w-[400px] h-[300px] flex items-center justify-center overflow-hidden">
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
              <div className="text-sm text-red-600 font-bold">
                ${product.currentPrice}
                <span className="ml-2 text-m text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              </div>
              <p className="flex items-center text-x text-gray-700 mt-1">
                {renderStars(product.reviews.rate)} ({product.reviews.count}{" "}
                reviews)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurProducts;
