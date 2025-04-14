import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { backendAPI } from "../../endpoint";
import axios from "axios";
import { MdCheckCircle, MdErrorOutline } from "react-icons/md";

const AccountVerification = () => {
  const [message, setMessage] = useState("Verifying your account...");
  const [status, setStatus] = useState("loading");
  const [email, setEmail] = useState(null);
  const [showResend, setShowResend] = useState(false);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link.");
      setStatus("error");
      return;
    }

    // Check if this token has already been verified
    if (localStorage.getItem(`verified_${token}`)) {
      setMessage("Account has already been verified! You can now log in.");
      setStatus("success");
      return;
    }

    const verifyUser = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${backendAPI}/api/verify?token=${token}`
        );

        if (response.status === 200) {
          setMessage("Account verified successfully! You can now log in.");
          setStatus("success");

          // Store token in localStorage to prevent re-verification
          localStorage.setItem(`verified_${token}`, "true");
        } else {
          setMessage(response.data.message || "Verification failed.");
          setStatus("error");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "⚠️ An error occurred. Please try again later.";
        setMessage(errorMessage);
        setStatus("error");

        if (errorMessage.includes("Token expired")) {
          setShowResend(true);
          setEmail(error.response?.data?.email || null);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  const resendVerificationEmail = async () => {
    setLoading(true);
    if (!email) return;

    try {
      const response = await axios.post(
        `${backendAPI}/api/verify/resend/account/verification`,
        { email }
      );
      setMessage(
        response.data.message || "A new verification email has been sent."
      );
      setStatus("success");
      setShowResend(false);
    } catch (error) {
      setMessage("Failed to resend verification email. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopHeader />
      <Header />
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center">
        <div className="p-6 bg-white rounded-lg shadow-lg text-center">
          {message && (
            <div
              className={`mb-4 p-3 rounded flex items-center gap-2 text-sm ${
                status === "success"
                  ? "bg-green-100 text-green-700"
                  : status === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {status === "success" ? (
                <MdCheckCircle className="text-xl" />
              ) : (
                <MdErrorOutline className="text-xl" />
              )}
              {message}
            </div>
          )}

          {showResend && (
            <div className="mt-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email || ""}
                onChange={(e) => setEmail(e.target.value)}
                className="imt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={resendVerificationEmail}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                disabled={!email} // Disable if email is empty
              >
                Resend Email
              </button>
            </div>
          )}

          
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountVerification;
