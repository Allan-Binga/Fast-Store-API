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
import BrandProducts from "./pages/brandProducts/BrandProducts";
import Success from "./pages/successPage/success";
import Orders from "./pages/orders/orders";
import PasswordReset from "./pages/passwordReset/passwordreset";
import CategoryProducts from "./pages/categoryProducts/categoryProducts";
// import RegistrationSuccess from "./pages/verifyEmail/verifyEmail";
import AccountVerification from "./pages/accountVerification/accountVerification";
import ChangePassword from "./pages/changePassword/changePassword";
import Terms from "./pages/termsOfUse/terms";
import Contact from "./pages/contact/contact";
import Policy from "./pages/privacyPolicy/policy";
import Faq from "./pages/faq/faq";
import OtpVerification from "./pages/otp/otpVerification";

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
        <Route path="/brand/:id/products" element={<BrandProducts />} />
        <Route path="/categories/:category" element={<CategoryProducts />} />
        <Route path="/success" element={<Success />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/account-verification" element={<AccountVerification />} />
        <Route path="/password/reset" element={<ChangePassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
      </Routes>
    </Router>
  );
};

export default App;
