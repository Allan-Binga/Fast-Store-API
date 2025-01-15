import React from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

const Signup = () => {
  return (
    <div>
      <TopHeader />
      <Header />
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

          {/* Right Section: Form */}
          <div className="flex-1 flex flex-col p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-800">
              Create an account
            </h1>
            <p className="text-gray-600 mt-2">Enter your details below</p>

            <form className="flex flex-col gap-6 mt-8">
              <InputField label="Name" id="name" />
              <InputField
                label="Email or Phone Number"
                id="email"
                type="email"
              />
              <InputField label="Password" id="password" type="password" />

              <button
                type="submit"
                className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition duration-200"
              >
                Create Account
              </button>
            </form>

            <div className="flex flex-col items-center mt-6">
              <SocialButton
                icon="https://cdn.builder.io/api/v1/image/assets/TEMP/070310f8e34f3c88f8561a7fb1303e166e6b39fba813cb5a880b02578cf1c002?placeholderIfAbsent=true&apiKey=8cd4e88793e947cca676caa403f196cb"
                text="Sign up with Google"
              />
              <p className="mt-4 text-gray-600">
                Already have an account?{" "}
                <a href="/login" className="text-blue-500 hover:underline">
                  Log in
                </a>
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

// InputField Component
const InputField = ({ label, type = "text", id }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-gray-600 font-medium">
      {label}
    </label>
    <input
      type={type}
      id={id}
      className="mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

// SocialButton Component
const SocialButton = ({ icon, text }) => (
  <button className="flex items-center justify-center w-full py-3 mt-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200">
    <img src={icon} alt="Google Icon" className="w-5 h-5 mr-2" />
    <span className="text-gray-700">{text}</span>
  </button>
);
