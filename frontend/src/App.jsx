import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

// Storefront pages.
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import ShoppingCart from "./pages/ShoppingCart";

function App() {
  return (
    <Router>
      {/* Shopper page routes. */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<ShoppingCart />} />
      </Routes>
    </Router>
  );
}

export default App;
