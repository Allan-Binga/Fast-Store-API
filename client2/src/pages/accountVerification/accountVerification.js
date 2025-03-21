import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { backendAPI } from "../../endpoint";
import axios from "axios";
import { MdCheckCircle, MdError } from "react-icons/md";

const AccountVerification = () => {
  const [message, setMessage] = useState("Verifying your account...");
  const [status, setStatus] = useState("loading");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link.");
      setStatus("error");
      return;
    }

    const verifyUser = async () => {
      try {
        const response = await axios.get(
          `${backendAPI}/api/verify?token=${token}`
        );

        if (response.status === 200) {
          setMessage("Account verified successfully! You can now log in.");
          setStatus("success");
        } else {
          setMessage(response.data.message || "Verification failed.");
          setStatus("error");
        }
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "⚠️ An error occurred. Please try again later."
        );
        setStatus("error");
      }
    };

    verifyUser();
  }, [token]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopHeader />
      <Header />
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center">
        <div className="p-6 bg-white rounded-lg shadow-lg text-center">
          <h2
            className={`text-xl font-semibold flex items-center justify-center gap-2 ${
              status === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {status === "success" ? (
              <MdCheckCircle className="text-2xl" />
            ) : (
              <MdError className="text-2xl" />
            )}
            {message}
          </h2>
          {status === "success" && (
            <a
              href="/login"
              className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Login
            </a>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountVerification;
