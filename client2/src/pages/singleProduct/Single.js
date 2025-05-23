import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { backendAPI } from "../../endpoint";
import { TbTruckDelivery } from "react-icons/tb";
import { CiHeart, CiShoppingCart } from "react-icons/ci";
import { HiArrowPathRoundedSquare } from "react-icons/hi2";
import { FaStar, FaRegStar } from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";
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

  //Handle adding a product to wishlist
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

  //Handle adding a product to cart
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

  //Buy Now handling
  const handleBuyNow = async () => {
    const stripe = await loadStripe(
      process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
    );

    try {
      const response = await axios.post(
        `${backendAPI}/api/checkout/create-checkout-session`,
        {
          items: [
            {
              name: product.name,
              description: product.description,
              price: product.price,
              quantity,
              image: product.image,
            },
          ],
        },
        { withCredentials: true }
      );

      const session = response.data;

      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        toast.error("Checkout failed. Please try again.");
      }
    } catch (error) {
      toast.error("Checkout failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopHeader />
      <Header />

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <LoadingScreen />
        ) : product ? (
          <div className="bg-white rounded-2xl p-6 grid md:grid-cols-2 gap-5">
            {/* Product Image */}
            <div className="flex justify-center items-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-w-md rounded-xl"
              />
            </div>

            {/* Product Details */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center text-gray-700 text-sm">
                    {renderStars(product.reviews.rate)}
                    <span className="ml-2">
                      ({product.reviews.count} reviews)
                    </span>
                  </div>
                  <span className="text-green-600 font-medium text-sm">
                    In Stock
                  </span>
                </div>

                <div className="mt-5 text-3xl font-semibold text-gray-900">
                  ${product.currentPrice}
                  <span className="ml-3 text-base text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                </div>

                <p className="text-gray-600 mt-4 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quantity + Buy + Wishlist */}
              <div className="mt-6 flex items-center gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center bg-white border border-gray-300 rounded-lg h-12">
                  <button
                    className="px-4 h-full rounded-l hover:bg-blue-600 hover:text-white transition-colors"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 h-full flex items-center justify-center">
                    {quantity}
                  </span>
                  <button
                    className="px-4 h-full rounded-r hover:bg-blue-600 hover:text-white transition-colors"
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    +
                  </button>
                </div>

                {/* Buy Now Button */}
                <button
                  className="flex-grow h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors px-6"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>

                {/* Wishlist Button */}
                <button
                  className="h-12 w-12 bg-white hover:bg-red-600 border border-gray-300 text-gray-500 rounded-lg flex items-center justify-center transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWishlist(product);
                  }}
                >
                  <CiHeart size={24} />
                </button>

                {/* Add to cart Button */}
                <button
                  className="h-12 w-12 bg-white hover:bg-blue-400 border border-gray-300 text-gray-500 rounded-lg flex items-center justify-center transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product._id);
                  }}
                >
                  <CiShoppingCart size={24} />
                </button>
              </div>

              {/* Delivery + Return */}
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-xl">
                  <TbTruckDelivery className="text-gray-800 text-2xl mt-1" />
                  <div>
                    <p className="text-gray-800 font-semibold">Free Delivery</p>
                    <p className="text-gray-500 text-sm">
                      Free delivery for orders above $100.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 border rounded-xl">
                  <HiArrowPathRoundedSquare className="text-gray-800 text-2xl mt-1" />
                  <div>
                    <p className="text-gray-800 font-semibold">Free Returns</p>
                    <p className="text-gray-500 text-sm">
                      Free 30-day return policy.
                    </p>
                  </div>
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
