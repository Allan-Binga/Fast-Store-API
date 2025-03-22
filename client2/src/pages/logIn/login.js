import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import { backendAPI } from "../../endpoint";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const loginUser = async (userData) => {
    setIsLoading(true);
    try {
      await axios.post(`${backendAPI}/api/auth/login`, userData, {
        withCredentials: true,
      });
      toast.success("Login successful! Redirecting...", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await loginUser(formData);
  };

  const isFormValid = () => {
    return formData.email && formData.password;
  };

  return (
    <div className="relative min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <TopHeader />
      <Header />
      {isLoading && <LoadingScreen />}

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-wrap max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="hidden md:flex flex-1 items-center justify-center bg-blue-50">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/69e0f745a386da13ccf8560b79d75248221409e03e50215b2e917c121088ed4b"
              alt="E-commerce visual"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 flex flex-col p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-800">Login</h1>
            <p className="text-gray-600 mt-2">Enter your credentials below</p>
            <form className="flex flex-col gap-6 mt-8" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!isFormValid() || isLoading}
                className={`w-full py-3 font-semibold rounded-lg transition duration-200 ${
                  isFormValid() && !isLoading
                    ? "bg-blue-500 text-white hover:bg-blue-700"
                    : "bg-blue-300 text-white cursor-not-allowed"
                }`}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
            <div className="flex flex-col items-center mt-6">
              <p className="mt-4 text-gray-600">
                Don't have an account?{" "}
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => navigate("/signup")}
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
