import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { backendAPI } from "../../endpoint";
import axios from "axios";
import { CiTrash } from "react-icons/ci";
import { FaStar, FaRegStar } from "react-icons/fa";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Wishlist = () => {
  // const navigate = useNavigate();
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
    setLoading(true);
    try {
      const response = await axios.delete(`${backendAPI}/api/wishlist`, {
        data: { productId },
        withCredentials: true,
      });

      // Remove the product from frontend state
      setWishlistProducts((prev) =>
        prev.filter((product) => product._id !== productId)
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove product.");
    } finally {
      setLoading(false);
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        transition={Slide}
        theme="light"
      />
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
        </div>

        {loading && <LoadingScreen />}
        {error && <p className="text-lg text-red-500">{error}</p>}

        {!loading && wishlistProducts.length === 0 && !error && (
          <p className="text-lg text-gray-500 italic">
            No products in wishlist yet.
          </p>
        )}

        {/* Product Card */}
        <div className="grid grid-cols-4 gap-6 mt-6 mr-20">
          {wishlistProducts.map((product) => (
            <div
              key={product._id}
              className="relative flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group cursor-pointer transform hover:scale-105 duration-300"
            >
              {/* Discount Badge */}
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded">
                -{product.discount}%
              </div>

              {/*Trash Icon*/}
              <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full text-black hover:bg-red-500 cursor-pointer">
                <CiTrash
                  className="text-2xl"
                  onClick={() => removeFromWishlist(product._id)}
                />
              </div>

              {/* Product Image */}
              <div className="w-[400px] h-[280px] flex items-center justify-center overflow-hidden">
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
      <Footer />
    </div>
  );
};

export default Wishlist;
