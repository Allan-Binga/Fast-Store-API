import React from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";

const OtpVerification = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          OTP verification
        </h2>

        <label
          className="block text-left text-gray-700 text-sm mb-2"
          htmlFor="otp"
        >
          Enter OTP
        </label>
        <input
          type="text"
          id="otp"
          name="otp"
          placeholder="Enter 6-digit OTP"
          className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-semibold text-lg">
          Next
        </button>

        <p className="mt-4 text-sm text-gray-600">
          Didn’t receive OTP?{" "}
          <span className="text-blue-600 cursor-pointer hover:underline">
            Resend
          </span>
        </p>
      </div>
    </div>
  );
};

export default OtpVerification;
