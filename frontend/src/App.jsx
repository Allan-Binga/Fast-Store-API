import StoreProvider from "./store/StoreProvider";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

// Storefront pages.
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import ShoppingCart from "./pages/ShoppingCart";
import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import AccountVerification from "./pages/AccountVerification";
import PasswordReset from "./pages/PasswordReset";
import PasswordChange from "./pages/PasswordChange"

function App() {
  return (
    <Router>
      <StoreProvider>
        {/* Shopper page routes. */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account-verification" element={<AccountVerification />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/forgot-password" element={<PasswordReset />} />
          <Route path="/password/reset" element={<PasswordChange />} />
          <Route path="/password-change" element={<PasswordChange />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<ShoppingCart />} />
        </Routes>
      </StoreProvider>
    </Router>
  );
}

export default App;
