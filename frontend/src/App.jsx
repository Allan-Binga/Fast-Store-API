import StoreProvider from "./store/StoreProvider";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Storefront pages.
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import ShoppingCart from "./pages/ShoppingCart";
import Address from "./pages/Address";
import Checkout from "./pages/Checkout";
import PaymentResult from "./pages/PaymentResult";
import Orders from "./pages/Orders";
import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import AccountVerification from "./pages/AccountVerification";
import PasswordReset from "./pages/PasswordReset";
import PasswordChange from "./pages/PasswordChange";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ShippingReturns from "./pages/ShippingReturns";
import HelpCenter from "./pages/HelpCenter";
import WarrantyInfo from "./pages/WarrantyInfo";
import SecurityOverview from "./pages/SecurityOverview";
import CookieSettings from "./pages/CookieSettings";
import NotFound from "./pages/NotFound";

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
          <Route
            path="/account-verification"
            element={<AccountVerification />}
          />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/forgot-password" element={<PasswordReset />} />
          <Route path="/password/reset" element={<PasswordChange />} />
          <Route path="/password-change" element={<PasswordChange />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<PaymentResult />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/account/addresses" element={<Address />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/shipping-returns" element={<ShippingReturns />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/warranty" element={<WarrantyInfo />} />
          <Route path="/security" element={<SecurityOverview />} />
          <Route path="/security-overview" element={<SecurityOverview />} />
          <Route path="/cookies" element={<CookieSettings />} />
          <Route path="/cookie-settings" element={<CookieSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </StoreProvider>
    </Router>
  );
}

export default App;
