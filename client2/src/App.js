import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Homepage from "./pages/homepage/homepage";
import Signup from "./pages/signUp/signup";
import Login from "./pages/logIn/login";
import Wishlist from "./pages/wishlist/wishlist";
import Cart from "./pages/cart/cart";
import Account from "./pages/account/account";

const App = () => {
  return (
    <Router>
      <Toaster position="top-centre" toastOption={{ duration: 2000 }} />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </Router>
  );
};

export default App;
