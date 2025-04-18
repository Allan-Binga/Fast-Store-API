import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CiHeart } from "react-icons/ci";
import { BsCart3 } from "react-icons/bs";
import { FaStar, FaRegStar } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { backendAPI } from "../../endpoint";

const RecentlyViewed = () => {
  const navigate = useNavigate();
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const storedProducts =
      JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    setRecentlyViewed(storedProducts);
  }, []);

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
    let recentProducts =
      JSON.parse(localStorage.getItem("recentlyViewed")) || [];

    // Find the clicked product from products (const [products, setProducts] = useState([]);)
    const product = recentlyViewed.find((p) => p._id === id);
    if (!product) return; // Avoid errors if product isn't found

    // Remove the product if it already exists
    recentProducts = recentProducts.filter((p) => p._id !== id);

    // Add the new product at the beginning
    recentProducts.unshift(product);

    // Keep only the latest 6 products
    recentProducts = recentProducts.slice(0, 4);

    localStorage.setItem("recentlyViewed", JSON.stringify(recentProducts));
    navigate(`/products/${id}`);
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
      {/*Recently Viewed Header*/}
      <div className="flex items-center gap-4">
        <div className="w-5">
          <div className="h-10 bg-blue-500" />
        </div>
        <div className="font-semibold text-secondary-2 text-[16px] tracking-[0.02em] leading-[1.5]">
          Recently Viewed
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="text-text-2 font-semibold text-[36px] tracking-[0.02em] leading-[1.2]">
          Continue where you left off
        </div>
      </div>

      {/* Product Card */}
      <div className="grid grid-cols-4 gap-6 mt-6 mr-20">
        {recentlyViewed.map((product) => (
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
                onClick={() => handleAddToWishlist(product)}
              />
            </div>

            {/* Shopping Cart Icon */}
            <div className="absolute top-16 right-4 flex items-center justify-center w-10 h-10 rounded-full text-black hover:bg-blue-500 cursor-pointer">
              <BsCart3
                className="text-3xl"
                onClick={() => handleAddToCart(product._id)}
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
              <div className="text-base text-blue-600 font-bold">
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

export default RecentlyViewed;
