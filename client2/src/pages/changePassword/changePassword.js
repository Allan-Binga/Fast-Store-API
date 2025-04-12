import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import axios from "axios";
import { backendAPI } from "../../endpoint";
import { MdCheckCircle, MdErrorOutline } from "react-icons/md";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // Run token verification on mount
  useEffect(() => {
    if (token) {
      const verifyToken = async () => {
        try {
          const response = await axios.get(
            `${backendAPI}/api/verify/password/token?token=${token}`
          );
          setMessage(response.data.message);
          setStatus("success");
        } catch (error) {
          setMessage(
            error.response?.data?.message || "Token verification failed."
          );
          setStatus("error");
          setShowResend(true);
        }
      };

      verifyToken();
    }
  }, [token]);

  //Resend password reset email
  const resendPasswordResetEmail = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      setStatus("error");
      return;
    }

    try {
      const response = await axios.post(
        `${backendAPI}/api/verify/resend/password/reset`,
        { email }
      );
      setMessage(response.data.message);
      setStatus("success");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to resend email.");
      setStatus("error");
    }
  };

  // Handle password reset submission
  const resetPassword = async (userData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendAPI}/api/password/reset/password`,
        userData
        // { withCredentials: true }
      );
      setMessage(response.data.message);
      setStatus("success");
      // Redirect to login after successful password reset
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    // Client-side validation
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setStatus("error");
      return;
    }

    resetPassword({ newPassword });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopHeader />
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md mt-4 bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Reset Password
          </h2>

          {/* Status Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded flex items-center gap-2 ${
                status === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {status === "success" ? <MdCheckCircle /> : <MdErrorOutline />}
              {message}
            </div>
          )}

          {/* Conditional Rendering */}
          {showResend ? (
            // Resend Email Component
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Enter your email to request a new password reset link
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <button
                onClick={resendPasswordResetEmail}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              >
                Resend Email
              </button>
            </div>
          ) : (
            // Reset Password Form
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChangePassword;
