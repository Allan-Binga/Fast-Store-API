import React, { useState, useEffect } from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FaRegTrashAlt } from "react-icons/fa";
import { backendAPI } from "../../endpoint";
import axios from "axios";
import toast from "react-hot-toast";

const Cart = () => {
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendAPI}/api/cart/user`, {
          withCredentials: true,
        });
        setCartProducts(response.data.products);
        setError(null);
      } catch (err) {
        setError("Failed to load cart products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, newQuantity) => {
    setCartProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === productId
          ? { ...product, quantity: Math.max(1, newQuantity) }
          : product
      )
    );
  };

  const calculateSubtotal = (price, quantity) => price * quantity;
  const calculateTotal = () => {
    return cartProducts
      .reduce(
        (total, product) =>
          total + calculateSubtotal(product.price, product.quantity),
        0
      )
      .toFixed(2);
  };

  const handleRemoveProduct = async (productId) => {
    try {
      const response = await axios.delete(`${backendAPI}/api/cart/remove`, {
        data: { productId },
        withCredentials: true,
      });
      setCartProducts((prev) =>
        prev.filter((product) => product._id !== productId)
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove product.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopHeader />
      <Header />
      <div className="flex-grow container mx-auto px-6 py-8">
        {loading ? (
          <p className="text-center text-gray-600 text-lg">
            Loading your cart...
          </p>
        ) : error ? (
          <p className="text-center text-red-600 text-lg">{error}</p>
        ) : cartProducts.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            Your cart is empty.
          </p>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cart Items Section */}
            <div className="w-full md:w-4/3 bg-white shadow-lg rounded-lg p-6">
              <div className="grid grid-cols-5 gap-2 border-b pb-4 text-gray-700 font-medium text-sm md:text-base">
                <div>Product</div>
                <div>Price</div>
                <div>Quantity</div>
                <div>Subtotal</div>
              </div>

              {cartProducts.map((product) => (
                <div
                  key={product._id}
                  className="grid grid-cols-5 gap-2 items-center py-6 border-b last:border-none"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <div className="text-gray-700 truncate max-w-[160px] text-sm">
                      {product.name}
                    </div>
                  </div>
                  <div className="text-gray-700 font-medium text-sm">
                    ${product.price.toFixed(2)}
                  </div>
                  <div>
                    <input
                      type="number"
                      value={product.quantity}
                      min={1}
                      className="w-12 px-2 py-1 border rounded-md text-center focus:ring focus:ring-indigo-200"
                      onChange={(e) =>
                        handleQuantityChange(
                          product._id,
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </div>
                  <div className="text-gray-700 font-medium text-sm">
                    $
                    {calculateSubtotal(product.price, product.quantity).toFixed(
                      2
                    )}
                  </div>
                  <div className="text-right">
                    <FaRegTrashAlt
                      className="text-gray-500 hover:text-red-600 cursor-pointer transition duration-200"
                      onClick={() => handleRemoveProduct(product._id)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Total Section */}
            <div className="w-full md:w-1/3 self-start bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Cart Total</h2>
              <div className="flex justify-between border-b pb-2 mb-2 text-gray-700 text-sm">
                <span>Subtotal:</span>
                <span>${calculateTotal()}</span>
              </div>
              <div className="flex justify-between border-b pb-2 mb-2 text-gray-700 text-sm">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-700 text-sm">
                <span>Total</span>
                <span>${calculateTotal()}</span>
              </div>
              <button className="bg-red-500 text-white w-full py-3 mt-4">
                Proceed to checkout
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
