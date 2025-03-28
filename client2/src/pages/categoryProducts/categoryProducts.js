import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { backendAPI } from "../../endpoint";
import axios from "axios";
import Footer from "../../components/footer/Footer";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import { CiHeart, CiShoppingCart } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";

const CategoryProducts = () => {
  const navigate = useNavigate();
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
  }, [category]);

  //Reviews Section Starts
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
            <FaRegStar key={`empty-${i}`} className="text-white" />
          ))}
      </>
    );
  };

  //Adding product to wishlist
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

  //Adding product to cart
  const handleAddToCart = async (productId) => {
    try {
      const response = await axios.post(
        `${backendAPI}/api/products/add-to-cart`,
        {
          products: [{ productId, quantity: 1 }],
        },
        { withCredentials: true }
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
          toast.info(error.response.data.error);
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
    const product = categoryProducts.find((p) => p._id === id);
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        transition={Slide}
        theme="light"
      />
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
          <LoadingScreen />
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => handleProductClick(product._id)}
                className="relative flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group cursor-pointer transform hover:scale-105 duration-300"
              >
                {/* Discount Badge */}
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold py-1 px-2 rounded">
                  -{product.discount}%
                </div>

                {/* Heart Icon */}
                <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full text-gray-700 hover:bg-gray-200 hover:text-red-500 cursor-pointer transition">
                  <CiHeart
                    className="text-2xl"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents the click from bubbling up
                      handleAddToWishlist(product);
                    }}
                  />
                </div>

                {/* Shopping Cart Icon */}
                <div
                  className="absolute top-16 right-4 flex items-center justify-center w-10 h-10 rounded-full text-gray-700 hover:bg-gray-200 hover:text-blue-500 cursor-pointer transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product._id);
                  }}
                >
                  <CiShoppingCart className="text-2xl" />
                </div>

                {/* Product Image */}
                <div className="w-full h-[280px] flex items-center justify-center overflow-hidden bg-white">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-contain h-full max-w-[90%]"
                  />
                </div>

                {/* Product Details */}
                <div className="p-4 flex flex-col gap-2 mt-auto">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="text-sm text-blue-600 font-bold">
                    ${product.currentPrice}
                    <span className="ml-2 text-gray-500 text-sm line-through">
                      ${product.originalPrice}
                    </span>
                  </div>
                  <p className="flex items-center text-sm text-gray-600 mt-1">
                    {renderStars(product.reviews.rate)} ({product.reviews.count}{" "}
                    reviews)
                  </p>
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
