import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { backendAPI } from "../../endpoint";
import { TbTruckDelivery } from "react-icons/tb";
import { CiHeart } from "react-icons/ci";
import { HiArrowPathRoundedSquare } from "react-icons/hi2";
import { FaStar, FaRegStar } from "react-icons/fa";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";

const Single = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${backendAPI}/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        toast.error("Error fetching product.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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
    <div className="min-h-screen bg-gray-100">
      <TopHeader />
      <Header />

      <div className="container mx-auto p-6">
        {loading ? (
          <LoadingScreen />
        ) : product ? (
          <div className="bg-white shadow-md rounded-lg p-6 grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="flex justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full md:w-[400px] rounded-lg shadow-lg"
              />
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="flex items-center text-x text-gray-700 mt-1">
                  {renderStars(product.reviews.rate)} ({product.reviews.count}{" "}
                  reviews)
                </p>
                <span className="text-green-600 font-semibold text-m ">
                  In Stock
                </span>
              </div>

              <div className="mt-4 text-3xl font-bold text-gray-900">
                ${product.currentPrice}
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              </div>
              <p className="text-gray-600 mt-2">{product.description}</p>

              {/* Quantity, Buy Now & Wishlist */}
              <div className="mt-6 flex flex-row items-center justify-between w-full gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center border border-white-300 rounded-lg bg-white h-12">
                  <button
                    className="bg-white hover:bg-blue-600 hover:text-white px-3 py-1 rounded-l text-lg"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 bg-gray-100">{quantity}</span>
                  <button
                    className="bg-white hover:bg-blue-600 hover:text-white px-3 py-1 rounded-r text-lg w-fit"
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    +
                  </button>
                </div>

                {/* Buy Now Button */}
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex-grow h-12">
                  Buy Now
                </button>

                {/* Wishlist Button */}
                <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-3 rounded-lg h-12 flex items-center justify-center">
                  <CiHeart size={24} />
                </button>
              </div>

              {/* Free Delivery & Returns */}
              <div className="mt-6 space-y-3">
                <div className="border p-4 rounded-lg flex items-center gap-3">
                  <TbTruckDelivery className="text-gray-800 text-2xl" />
                  <span className="text-gray-800 font-semibold">
                    Free Delivery
                  </span>
                  <span className="text-gray-500 text-sm ml-auto">
                    Free delivery for orders above $100.
                  </span>
                </div>
                <div className="border p-4 rounded-lg flex items-center gap-3">
                  <HiArrowPathRoundedSquare className="text-gray-800 text-2xl" />
                  <span className="text-gray-800 font-semibold">
                    Free Returns
                  </span>
                  <span className="text-gray-500 text-sm ml-auto">
                    Free 30-day return policy.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-lg font-semibold text-red-600">
            Product not found.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Single;
