import React, { useEffect, useState } from "react";
import "./shoppingcart.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import Bar from "../../components/categoriesBar/bar";
import { loadStripe } from "@stripe/stripe-js";
import { MdDelete } from "react-icons/md";

// Helper function to truncate text
const truncateText = (text, maxLength) => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const ShoppingCart = () => {
  const [cartProducts, setCartProducts] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartProducts(savedCart);
  }, []);

  const removeProduct = (productId) => {
    const updatedCart = cartProducts.filter(
      (product) => product._id !== productId
    );
    setCartProducts(updatedCart);
    // Update localStorage after state change
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId, newQuantity) => {
    const updatedCart = cartProducts.map((item) =>
      item._id === productId
        ? { ...item, quantity: Math.max(1, newQuantity) }
        : item
    );
    setCartProducts(updatedCart);
    // Update localStorage after state update
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const calculateTotal = () => {
    return cartProducts.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  };

  const handleCheckout = async () => {
    const stripe = await loadStripe(
      process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
    );

    // Send cart data to your backend for session creation
    const response = await fetch(
      "http://localhost:5500/api/checkout/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartProducts.map((product) => ({
            title: product.title,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            image: product.image,
          })),
        }),
      }
    );

    const session = await response.json();

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      console.error("Error redirecting to checkout:", error);
    } else {
      // Clear the cart after successful checkout
      setCartProducts([]);
      localStorage.removeItem("cart");
    }
  };

  return (
    <div className="shopping-cart">
      <Navbar />
      <Bar />
      <div className="cart-container">
        <div className="cart-header">
          <h2>Shopping Cart</h2>
        </div>
        {cartProducts.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty!</p>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartProducts.map((item) => (
                <div className="cart-item" key={item._id}>
                  <div className="item-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="item-details">
                    <p className="item-title">{item.title}</p>
                    {/* Truncate description if it's too long */}
                    <p className="item-description">
                      {truncateText(item.description, 100)}{" "}
                      {/* Set your max length here */}
                    </p>
                    <div className="item-quantity">
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="item-total">
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      className="remove-button"
                      onClick={() => removeProduct(item._id)}
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <p>
                Items ({cartProducts.length}):{" "}
                <strong>${calculateTotal().toFixed(2)}</strong>
              </p>
              <button className="checkout-button" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ShoppingCart;
