import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./pages/register/register";
import Login from "./pages/login/login";
import Home from "./pages/home/home";
import Product from "./pages/products/products";
import SingleProduct from "./pages/singleProduct/single";
import { Toaster } from "react-hot-toast";
import AddProduct from "./pages/addProducts/addProduct";
import UpdateProduct from "./pages/updateProduct/updateProduct";
import Categories from "./pages/categories/categories";
import CategoryProduct from "./pages/categoryProducts/categoryProducts";
import Users from "./pages/users/users";
import "./global.css";
import SingleUser from "./pages/singleUser/singleUser";
import UpdateUser from "./pages/updateUser/updateUser";
import ShoppingCart from "./pages/shoppingCart/shoppingCart";
import Checkout from "./pages/checkout/checkout";
import Success from "./pages/success/success";

const App = () => {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Product />} />
        <Route path="/products/update/:id" element={<UpdateProduct />} />
        <Route path="/products/:id" element={<SingleProduct />} />
        <Route path="/products/add" element={<AddProduct />} />
        <Route path="/products/allcategories" element={<Categories />} />
        <Route
          path="/products/category/:category"
          element={<CategoryProduct />}
        />
        <Route path="/faststore/cart" element={<ShoppingCart />} />
        <Route path="/faststore/users" element={<Users />} />
        <Route path="/faststore/users/:id" element={<SingleUser />} />
        <Route path="/faststore/users/update/:id" element={<UpdateUser />} />
        <Route path="/faststore/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </Router>
  );
};

export default App;
