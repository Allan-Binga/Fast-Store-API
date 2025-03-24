import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "react-phone-input-2/lib/style.css";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import { backendAPI } from "../../endpoint";

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value) => {
    if (!value.startsWith("+")) {
      value = "+" + value;
    }
    setFormData({ ...formData, phone: value });
  };

  const registerUser = async (userData) => {
    try {
      await axios.post(`${backendAPI}/api/auth/register`, userData);
    } catch (error) {
      throw error.response?.data?.message || "Something went wrong!";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      await registerUser(formData);

      const toastId = toast.success(
        "Registration successful! Check your email.",
        {
          position: "top-right",
          autoClose: 3000,
          transition: Slide,
          theme: "light",
          pauseOnHover: true,
        }
      );

      toast.onChange((payload) => {
        if (payload.status === "removed" && payload.id === toastId) {
          navigate("/login");
        }
      });
    } catch (err) {
      toast.info("Registration failed: " + err, {
        position: "top-right",
        autoClose: 3000,
        transition: Slide,
        theme: "light",
        pauseOnHover: true,
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const isFormValid = () => {
    return Object.values(formData).every((field) => field.trim() !== "");
  };

  return (
    <div className="relative min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        transition={Slide}
        theme="light"
      />
      <TopHeader />
      <Header />
      {isLoading && <LoadingScreen />} {/* Show loading when submitting */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-wrap max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="hidden md:flex flex-1 items-center justify-center bg-blue-50">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/69e0f745a386da13ccf8560b79d75248221409e03e50215b2e917c121088ed4b"
              alt="E-commerce visual"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 flex flex-col p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-800">
              Create an account
            </h1>
            <p className="text-gray-600 mt-2">Enter your details below</p>

            <form className="flex flex-col gap-6 mt-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
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

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="w-full">
                  <PhoneInput
                    country={"us"}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    enableSearch
                    containerClass="w-full mt-1"
                    inputClass="!w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
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
                Signup
              </button>
            </form>

            <div className="flex flex-col items-center mt-6">
              <p className="mt-4 text-gray-600">
                Already have an account?{" "}
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Log in
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

export default Signup;
