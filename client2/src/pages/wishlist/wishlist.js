import React, { useState, useEffect } from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { backendAPI } from "../../endpoint";
import axios from "axios";
import { CiTrash } from "react-icons/ci";
import { FaStar, FaRegStar } from "react-icons/fa";
import toast from "react-hot-toast";

const Wishlist = () => {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const getWishlistProducts = async () => {
    try {
      const response = await axios.get(`${backendAPI}/api/wishlist/user`, {
        withCredentials: true, // Ensures cookies are sent with the request
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to fetch wishlist.";
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await axios.delete(`${backendAPI}/api/wishlist`, {
        data: { productId },
        withCredentials: true,
      });

      // Remove the product from frontend state
      setWishlistProducts((prev) =>
        prev.filter((product) => product._id !== productId)
      );
      toast.success(response.data.message); // Keep the toast for successful removal
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove product.");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getWishlistProducts();
        setWishlistProducts(data.products || []);
        setError(null); // Clear any previous errors
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchProducts();
  }, []);

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
    <div className="flex flex-col min-h-screen">
      <TopHeader />
      <Header />
      <div className="flex-grow flex flex-col items-start gap-4 relative ml-[150px] mt-[35px]">
        <div className="flex items-center gap-4">
          <div className="w-6">
            <div className="h-10 bg-blue-500" />
          </div>
          <div className="font-semibold text-secondary-2 text-[46px] tracking-[0.02em] leading-[1.5]">
            Wishlist
          </div>
        </div>

        <div className="flex justify-between items-center w-full px-4 py-2">
          <div className="text-black font-semibold text-lg">
            Wishlist ({wishlistProducts.length})
          </div>
          <button className="text-black text-m font-medium h-9 px-4 border-2 border-black mr-[150px]">
            Move All To Cart
          </button>
        </div>

        {loading && (
          <p className="text-lg text-gray-600">Loading wishlist...</p>
        )}
        {error && <p className="text-lg text-red-500">{error}</p>}

        {!loading && wishlistProducts.length === 0 && !error && (
          <p className="text-lg text-gray-500 italic">
            No products in wishlist yet.
          </p>
        )}

        <div className="grid grid-cols-4 gap-6 mt-6 mr-20">
          {wishlistProducts.map((product) => (
            <div
              key={product._id}
              className="relative flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group"
            >
              <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full text-black hover:bg-red-500 cursor-pointer">
                <CiTrash
                  className="text-3xl"
                  onClick={() => removeFromWishlist(product._id)}
                />
              </div>
              <div className="w-[300px] h-[350px] flex items-center justify-center overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="object-contain max-h-full max-w-full"
                />
              </div>

              <h3 className="text-lg font-bold">{product.name}</h3>
              <div className="text-base text-red-600 font-bold">
                ${product.currentPrice}
                <span className="ml-2 text-m text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              </div>
              <p className="flex items-center text-xs text-gray-700 mt-1">
                {renderStars(product.reviews.rate)} ({product.reviews.count}{" "}
                reviews)
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
