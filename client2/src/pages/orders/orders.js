import React, { useState, useEffect } from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { backendAPI } from "../../endpoint";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserOrders = async () => {
    try {
      const response = await axios.get(`${backendAPI}/api/orders/user`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to retrieve orders";
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getUserOrders();
        setOrders(data || []);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <TopHeader />
      <Header />
      <div className="flex-grow p-4">
        {loading ? (
          <p className="text-gray-600">Loading orders...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="border p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold">Order ID: {order._id}</h3>
                <p className="text-sm text-gray-600">
                  Payment Status:{" "}
                  <span className="font-medium text-green-600">
                    {order.paymentStatus}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Total Amount: ${order.totalAmount} {order.currency.toUpperCase()}
                </p>
                <p className="text-sm text-gray-600">
                  Ordered On: {new Date(order.createdAt).toLocaleString()}
                </p>
                <h4 className="mt-2 font-medium">Items:</h4>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          ${item.price} x {item.quantity}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No orders found.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Orders;
