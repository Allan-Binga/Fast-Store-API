import React, { useState } from "react";
import "./shoppingcart.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import Bar from "../../components/categoriesBar/bar";

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: '2017 MACBOOK PRO 13"',
      price: 419.99,
      quantity: 1,
    },
    {
      id: 2,
      name: "Product 2",
      price: 15,
      quantity: 1,
    },
  ]);

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div>
      <Navbar />
      <Bar />
      <div className="cart-container">
        <h2>Shopping Cart</h2>
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                {/* Placeholder for item image */}
                <div className="image-placeholder"></div>
              </div>
              <div className="item-details">
                <p className="item-name">{item.name}</p>
                <p className="item-price">${item.price.toFixed(2)}</p>
                <select className="item-quantity" value={item.quantity}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
              <div className="item-total">
                <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <div className="summary-details">
            <p>Items ({cartItems.length})</p>
            <p>Subtotal: ${total.toFixed(2)}</p>
          </div>
          <div className="checkout-button">
            <button>Proceed to checkout.</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShoppingCart;
