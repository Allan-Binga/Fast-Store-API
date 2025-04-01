import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import axios from "axios";
import { backendAPI } from "../../endpoint";
import { MdCheckCircle, MdErrorOutline } from "react-icons/md";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Checking token validity...");
  const [status, setStatus] = useState("loading");
  const [email, setEmail] = useState(null);
  const [showResend, setShowResend] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid reset link.");
      setStatus("error");
      return;
    }

    const validateToken = async () => {
      try {
        const response = await axios.get(
          `${backendAPI}/api/verify/password/token?token=${token}`
        );

        if (response.status === 200) {
          setMessage("Token verified! You can reset your password.");
          setStatus("success");
          setEmail(response.data.email); // Store email for resending if needed
        } else {
          setMessage(response.data.message || "Token verification failed.");
          setStatus("error");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "⚠️ An error occurred.";
        setMessage(errorMessage);
        setStatus("error");

        if (errorMessage.includes("Token expired")) {
          setShowResend(true);
          setEmail(error.response?.data?.email || null);
        }
      }
    };

    validateToken();
  }, [token]);

  const resendResetEmail = async () => {
    if (!email) return;

    try {
      const response = await axios.post(
        `${backendAPI}/api/verify/password/resend`,
        { email }
      );
      setMessage(response.data.message || "A new reset email has been sent.");
      setStatus("success");
      setShowResend(false);
    } catch (error) {
      setMessage("Failed to resend email. Please try again.");
      setStatus("error");
    }
  };

  const updatePassword = (e) => {
    e.preventDefault();
    console.log("Password updated successfully");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopHeader />
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-2xl mt-4 bg-white p-8 rounded-xl shadow-xl border text-center">
          {status === "loading" ? (
            <p className="text-gray-600">Checking token validity...</p>
          ) : status === "success" ? (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Reset Password
              </h2>
              <form className="space-y-6" onSubmit={updatePassword}>
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Re-Enter Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Submit
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-sm font-semibold flex items-center justify-center gap-2 text-orange-500">
                <MdErrorOutline className="text-2xl" />
                {message}
              </h2>

              {showResend && (
                <div className="mt-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email || ""}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={resendResetEmail}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                  >
                    Resend Email
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChangePassword;
