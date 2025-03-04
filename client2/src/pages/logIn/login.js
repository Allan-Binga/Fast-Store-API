import React, { useState, useEffect } from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { backendAPI } from "../../endpoint";

const Login = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // LOGIN IMPLEMENTATION
  const loginUser = async (userData) => {
    try {
      await axios.post(`${backendAPI}/api/auth/login`, userData, {
        withCredentials: true,  // Enable cookies in the request
      });
      toast.success("Login successful!");
      navigate("/"); // Redirect to homepage
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Try again.");
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen">
      <TopHeader />
      <Header />

      {/* Progress Bar */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-800">
          <div className="h-full bg-blue-500 transition-all duration-300"></div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-wrap max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Left Section: Image */}
          <div className="hidden md:flex flex-1 items-center justify-center bg-blue-50">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/69e0f745a386da13ccf8560b79d75248221409e03e50215b2e917c121088ed4b?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb"
              alt="E-commerce visual"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Section: Login Form */}
          <div className="flex-1 flex flex-col p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Enter your details below</p>

            <form className="flex flex-col gap-6 mt-8" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={!isFormValid()}
                className={`w-full py-3 font-semibold rounded-lg transition duration-200 ${
                  isFormValid()
                    ? "bg-blue-500 text-white hover:bg-blue-700"
                    : "bg-blue-300 text-white hover:bg-blue-400"
                }`}
              >
                Login
              </button>
            </form>

            {/* Forgot Password & Signup Link */}
            <div className="flex flex-col items-center mt-6">
              <button className="text-blue-500 hover:underline">
                Forgot password?
              </button>
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
