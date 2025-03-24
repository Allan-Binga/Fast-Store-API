import React, { useState, useEffect } from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { backendAPI } from "../../endpoint";
import axios from "axios";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${backendAPI}/api/orders/user`, {
          withCredentials: true,
        });
        setOrders(response.data || []);
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            setError("Please log in to view your orders.");
          } else if (
            error.response.status === 400 ||
            error.response.status === 404
          ) {
            setError(error.response.data.error);
          } else {
            setError("An error occurred while retrieving orders.");
          }
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopHeader />
      <Header />
      <div className="flex-grow container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-6">
            <div className="h-10 bg-blue-500" />
          </div>
          <h1 className="font-semibold text-secondary-2 text-[46px] tracking-[0.02em] leading-[1.5]">
            My Orders
          </h1>
        </div>

        {loading ? (
          <LoadingScreen />
        ) : error ? (
          <p className="text-center text-red-500 text-lg">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            You have no orders yet.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white shadow-lg rounded-lg p-6"
              >
                <div className="grid grid-cols-4 gap-4 border-b pb-4 text-gray-700 font-medium text-sm md:text-base">
                  <div>Order ID</div>
                  <div>Total</div>
                  <div>Payment Status</div>
                  <div>Ordered On</div>
                </div>
                <div className="grid grid-cols-4 gap-4 items-center py-6 border-b last:border-none">
                  <div className="truncate text-sm">{order._id}</div>
                  <div className="font-medium text-sm">
                    ${order.totalAmount} {order.currency.toUpperCase()}
                  </div>
                  <div className="text-green-600 font-medium text-sm">
                    {order.paymentStatus}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <h3 className="mt-4 font-medium">Items</h3>
                <div className="grid grid-cols-4 gap-4 border-b pb-2 text-gray-700 font-medium text-sm">
                  <div>Product</div>
                  <div>Price</div>
                  <div>Quantity</div>
                  <div>Subtotal</div>
                </div>
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-4 items-center py-4 border-b last:border-none"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      <span className="text-gray-700 truncate max-w-[160px] text-sm">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-gray-700 font-medium text-sm">
                      ${item.price}
                    </div>
                    <div className="text-gray-700 text-sm">{item.quantity}</div>
                    <div className="text-gray-700 font-medium text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Orders;
