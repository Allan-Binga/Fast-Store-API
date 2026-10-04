import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import BrandDetails from "./pages/BrandDetails";
import Brands from "./pages/Brands";
import Categories from "./pages/Categories";
import CategoryDetails from "./pages/CategoryDetails";
import Checkouts from "./pages/Checkouts";
import Wallets from "./pages/Wallets";
import AdminWalletDetails from "./pages/WalletDetails";
import Deliveries from "./pages/Deliveries";
import DeliveryDetails from "./pages/DeliveryDetails";
import Home from "./pages/Home";
import Login from "./pages/Login";
import OrderDetails from "./pages/OrderDetails";
import Orders from "./pages/Orders";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";
import Promotions from "./pages/Promotions";
import RefundDetails from "./pages/RefundDetails";
import Refunds from "./pages/Refunds";
import Register from "./pages/Register";
import { useAdmin } from "./store/AdminContext";

function ProtectedLayout() {
  const { admin, checkingSession } = useAdmin();
  const location = useLocation();

  if (checkingSession) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface">
        <div className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  return admin ? (
    <AdminLayout />
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<Home />} />
        <Route path="checkouts" element={<Checkouts />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:orderId" element={<OrderDetails />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:productId" element={<ProductDetails />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/:category" element={<CategoryDetails />} />
        <Route path="brands" element={<Brands />} />
        <Route path="brands/:brandId" element={<BrandDetails />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="wallets" element={<Wallets />} />
        <Route path="wallets/:userId" element={<AdminWalletDetails />} />
        <Route path="deliveries/pending" element={<Deliveries />} />
        <Route path="deliveries" element={<Deliveries />} />
        <Route path="deliveries/:deliveryId" element={<DeliveryDetails />} />
        <Route path="refunds" element={<Refunds />} />
        <Route path="refunds/:refundId" element={<RefundDetails />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
