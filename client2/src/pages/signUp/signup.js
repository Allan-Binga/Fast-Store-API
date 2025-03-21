import React, { useState, useEffect } from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { backendAPI } from "../../endpoint";


const Signup = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  //CREATE ACCOUNT IMPLEMENTATION
  const registerUser = async (userData) => {
    try {
      await axios.post(`${backendAPI}/api/auth/register`, userData);
    } catch (error) {
      throw error.response.data.message;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await registerUser(formData);
      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
      navigate("/"); // Redirect to a new page telling them to check their email
    } catch (err) {
      toast.error("An error occurred during registration.");
    }
  };

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phone &&
      formData.password
    );
  };

  useEffect(() => {
    // Simulate a loading state that ends after 2 seconds (you can adjust this)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []);
  return (
    <div className="relative min-h-screen">
      <TopHeader />
      <Header />
      {/* Progress Bar */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-800">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${isLoading}%` }}
          ></div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center min-h-[110vh] bg-gray-100">
        <div className="flex flex-wrap max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Left Section: Image */}
          <div className="hidden md:flex flex-1 items-center justify-center bg-blue-50">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/69e0f745a386da13ccf8560b79d75248221409e03e50215b2e917c121088ed4b?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb"
              alt="E-commerce visual"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Section: Signup Form */}
          <div className="flex-1 flex flex-col p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-800">
              Create an account
            </h1>
            <p className="text-gray-600 mt-2">Enter your details below</p>

            <form className="flex flex-col gap-6 mt-8" onSubmit={handleSubmit}>
              {/* Name Input */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* First Name Input */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
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
                {/* Last Name Input */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
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

              {/* Phone Input */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <PhoneInput
                  country={"us"}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  enableSearch
                  inputClass="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Signup Button */}
              <button
                type="submit"
                disabled={!isFormValid()}
                className={`w-full py-3 font-semibold rounded-lg transition duration-200 ${
                  isFormValid()
                    ? "bg-blue-500 text-white hover:bg-blue-700"
                    : "bg-blue-300 text-white hover:bg-blue-400"
                }`}
              >
                Create Account
              </button>
            </form>

            {/* Already Have an Account */}
            <div className="flex flex-col items-center mt-6">
              <p className="mt-4 text-gray-600">
                Already have an account?{" "}
                <button
                  a
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
