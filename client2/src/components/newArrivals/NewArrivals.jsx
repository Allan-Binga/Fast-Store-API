import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { CiHeart, CiShoppingCart } from "react-icons/ci";
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
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          toast.error("Please login to add product to wishlist.");
        } else if (error.response.status === 400) {
          toast.error(error.response.data.error);
        } else {
          toast.error(
            "An error occurred while adding the product to the wishlist."
          );
        }
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error(
          "An error occurred while adding the product to the wishlist."
        );
      }
    }
  };

  //SHOPPING CART ICON for ADDING A PRODUCT TO CART
  const handleAddToCart = async (productId) => {
    try {
      const response = await axios.post(
        `${backendAPI}/api/products/add-to-cart`,
        {
          products: [{ productId, quantity: 1 }], // Sending product in expected format
        },
        {
          withCredentials: true, // Ensure cookies are sent for authentication
        }
      );

      toast.success(response.data.message);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Please login to add product to cart.");
        } else if (
          error.response.status === 400 ||
          error.response.status === 404
        ) {
          toast.error(error.response.data.error);
        } else {
          toast.error(
            "An error occurred while adding the product to the cart."
          );
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  //Clicking a single product
  const handleProductClick = (id) => {
    let recentProducts = JSON.parse(localStorage.getItem("recentlyViewed")) || []

    //Find clicked product
    const product = products.find((p) => p._id === id)
    if (!product) return
    //Remove if exists
    recentProducts = recentProducts.filter((p) => p._id !== id)

    //Add at the beginning
    recentProducts.unshift(product)

    //Keep latest 6 products
    recentProducts = recentProducts.slice(0, 4);

    localStorage.setItem("recentlyViewed", JSON.stringify(recentProducts));
    navigate(`/products/${id}`);
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
            onClick={() => handleProductClick(product._id)}
            className="relative flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group cursor-pointer transform hover:scale-105 duration-400"
          >
            {/* Discount Badge */}
            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold py-1 px-2 rounded">
              -{product.discount}%
            </div>
            {/* Heart Icon */}
            <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full text-black hover:bg-blue-500 cursor-pointer">
              <CiHeart
                className="text-3xl"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToWishlist(product);
                }}
              />
            </div>

            {/* Shopping Cart Icon */}
            <div className="absolute top-16 right-4 flex items-center justify-center w-10 h-10 rounded-full text-black hover:bg-blue-500 cursor-pointer">
              <CiShoppingCart
                className="text-3xl"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product._id);
                }}
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
