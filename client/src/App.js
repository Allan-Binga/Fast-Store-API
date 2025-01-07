import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./pages/register/register";
import Login from "./pages/login/login";
import Home from "./pages/home/home";
import Product from "./pages/products/products";
import SingleProduct from "./pages/singleProduct/single";
import SingleCart from "./pages/singleCart/singleCart";
import { Toaster } from "react-hot-toast";
import AddProduct from "./pages/addProducts/addProduct";
import UpdateProduct from "./pages/updateProduct/updateProduct";
import AddCart from "./pages/addCart/addCart";
import UpdateCart from "./pages/updateCart/update";
import Categories from "./pages/categories/categories";
import CategoryProduct from "./pages/categoryProducts/categoryProducts";
import Users from "./pages/users/users";
import "./global.css";
import Carts from "./pages/carts/carts";
import SingleUser from "./pages/singleUser/singleUser";
import UpdateUser from "./pages/updateUser/updateUser";
import ShoppingCart from "./pages/shoppingCart/shoppingCart";
import Checkout from "./pages/checkout/checkout";

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
        <Route path="/carts" element={<Carts />} />
        <Route path="/carts/update/:id" element={<UpdateCart />} />
        <Route path="/carts/:id" element={<SingleCart />} />
        <Route path="/carts/add" element={<AddCart />} />
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
      </Routes>
    </Router>
  );
};

export default App;
