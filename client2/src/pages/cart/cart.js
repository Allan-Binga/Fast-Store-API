import React, { useState, useEffect } from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FaRegTrashAlt } from "react-icons/fa";
import { backendAPI } from "../../endpoint";
import axios from "axios";

const Cart = () => {
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch cart products
  const getCartProducts = async () => {
    try {
      const response = await axios.get(`${backendAPI}/api/cart/user`, {
        withCredentials: true, // Corrected typo from wishCredentials to withCredentials
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching cart products:", error);
      throw error;
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getCartProducts();
        const productsWithQuantity = data.products.map((product) => ({
          ...product,
          quantity: product.quantity || 1, // Default quantity to 1
        }));
        setCartProducts(productsWithQuantity);
        setError(null);
      } catch (err) {
        setError("Failed to load cart products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handle quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    setCartProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, quantity: newQuantity }
          : product
      )
    );
  };

  // Calculate subtotal for a product
  const calculateSubtotal = (price, quantity) => price * quantity;

  // Calculate total price
  const calculateTotal = () => {
    return cartProducts
      .reduce((total, product) => {
        return (
          total + calculateSubtotal(product.currentPrice, product.quantity)
        );
      }, 0)
      .toFixed(2);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopHeader />
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading your cart...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : cartProducts.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty.</p>
          ) : (
            <div className="w-full max-w-[1200px] mx-auto">
              <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 text-left text-sm sm:text-base">
                  <div className="font-semibold">Product</div>
                  <div className="font-semibold">Price</div>
                  <div className="font-semibold">Quantity</div>
                  <div className="font-semibold">Subtotal</div>
                </div>

                {cartProducts.map((product) => (
                  <div
                    key={product.id}
                    className="grid grid-cols-5 gap-4 items-center p-4 border-b border-gray-200 text-sm sm:text-base"
                  >
                    {/* Product Image and Details */}
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 object-cover"
                      />
                      <div className="text-gray-700">{product.name}</div>
                    </div>
                    {/* Price */}
                    <div className="font-semibold">
                      ${product.currentPrice.toFixed(2)}
                    </div>
                    {/* Quantity */}
                    <div>
                      <input
                        type="number"
                        value={product.quantity}
                        min={1}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                        onChange={(e) =>
                          handleQuantityChange(
                            product.id,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                      />
                    </div>
                    {/* Subtotal */}
                    <div className="font-semibold">
                      $
                      {calculateSubtotal(
                        product.currentPrice,
                        product.quantity
                      ).toFixed(2)}
                    </div>
                    {/* Remove Product */}
                    <div className="text-right">
                      <FaRegTrashAlt
                        className="text-gray-500 hover:text-red-600 cursor-pointer"
                        onClick={() => {
                          console.log(`Remove product with ID: ${product.id}`);
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="p-4 text-right font-semibold">
                  Total: ${calculateTotal()}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
