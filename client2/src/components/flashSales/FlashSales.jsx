import React, { useState, useEffect } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { CiHeart, CiShoppingCart } from "react-icons/ci";
import { backendAPI } from "../../endpoint";
import axios from "axios";
import { FaStar, FaRegStar } from "react-icons/fa";
import toast from "react-hot-toast";

const PRODUCTS_ALLOWED = 4;

const FlashSales = () => {
  //const navigate = useNavigate(); // Initialize useNavigate
  const [products, setProducts] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 19,
    seconds: 56,
  });

  useEffect(() => {
    // Fetch flash sale products on component mount
    const fetchProducts = async () => {
      const data = await getFlashSaleProducts();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    // This is a simple countdown.
    const timer = setInterval(() => {
      if (timeLeft.seconds > 0) {
        setTimeLeft({ ...timeLeft, seconds: timeLeft.seconds - 1 });
      } else if (timeLeft.minutes > 0) {
        setTimeLeft({
          ...timeLeft,
          minutes: timeLeft.minutes - 1,
          seconds: 59,
        });
      } else if (timeLeft.hours > 0) {
        setTimeLeft({
          ...timeLeft,
          hours: timeLeft.hours - 1,
          minutes: 59,
          seconds: 59,
        });
      } else if (timeLeft.days > 0) {
        setTimeLeft({
          ...timeLeft,
          days: timeLeft.days - 1,
          hours: 23,
          minutes: 59,
          seconds: 59,
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

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

  //FETCHING FLASHSALE PRODUCTS FROM THE BACKEND
  const getFlashSaleProducts = async () => {
    try {
      const response = await axios.get(`${backendAPI}/api/flashsale`);
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
      toast.error("Something went wrong.");
    }
  };

  //SHOPPING CART ICON for ADDING A PRODUCT TO CART
  const handleAddToCart = async (product) => {
    try {
      // Wrap the product in an array to match the backend's expected format
      const response = await axios.post(
        `${backendAPI}/api/products/add-to-cart`,
        { products: [product] }, // Wrap the product in an array
        {
          withCredentials: true, // Send cookies for authentication
        }
      );
      toast.success("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error(
        error.response?.data?.error || "Failed to add product to cart."
      );
    }
  };

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

  return (
    <div className="flex flex-col items-start gap-4 relative ml-[150px] mt-[35px]">
      {/* Flash Sales Header */}
      <div className="flex items-center gap-4">
        <div className="w-5">
          <div className="h-10 bg-blue-500" />
        </div>
        <div className="font-semibold text-secondary-2 text-[16px] tracking-[0.02em] leading-[1.5]">
          Today's Flash Sales
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="text-text-2 font-semibold text-[36px] tracking-[0.02em] leading-[1.2]">
          Flash Sales
        </div>
        <div className="text-xl text-black">
          {timeLeft.days} : {timeLeft.hours} : {timeLeft.minutes} :{" "}
          {timeLeft.seconds}
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
                className="text-3xl"
                onClick={() => handleAddToCart(product)}
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
              <h3 className="text-xl font-bold text-gray-800">
                {product.name}
              </h3>
              <div className="text-base text-red-600 font-bold">
                ${product.currentPrice}
                <span className="ml-2 text-m text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Sale Ends: {new Date(product.endTime).toLocaleString()}
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

export default FlashSales;
