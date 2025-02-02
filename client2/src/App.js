import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Homepage from "./pages/homepage/homepage";
import Signup from "./pages/signUp/signup";
import Login from "./pages/logIn/login";
import Wishlist from "./pages/wishlist/wishlist";
import Cart from "./pages/cart/cart";
import Account from "./pages/account/account";
import Single from "./pages/singleProduct/Single";

const App = () => {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 1800 }} />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/my-account" element={<Account />} />
        <Route path="/products/:id" element={<Single />} />
      </Routes>
    </Router>
  );
};

export default App;
