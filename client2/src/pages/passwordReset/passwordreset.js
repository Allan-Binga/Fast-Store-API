import React, { useState } from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { backendAPI } from "../../endpoint";
import axios from "axios";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";

const PasswordReset = () => {
  // const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  //Reset Password API
  const resetPassword = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendAPI}/api/verify/reset-password`,
        {
          email, // Send email to backend
        }
      );

      toast.success(
        response.data.message || "Password reset email sent.",
        {
          position: "top-right",
          autoClose: 3000,
          transition: Slide,
          theme: "light",
          pauseOnHover: true,
        }
      );
      // toast.onChange((payload) => {
      //   if (payload.status === "removed" && payload.id === toastId) {
      //     navigate("/login");
      //   }
      // });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.", {
        position: "top-right",
        autoClose: 3000,
        transition: Slide,
        theme: "light",
        pauseOnHover: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await resetPassword(); // Call resetPassword when form is submitted
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        transition={Slide}
        theme="light"
      />
      <TopHeader />
      <Header />
      {loading && <LoadingScreen />}
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-xl border">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
            Reset Your Password
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Enter your email
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Send password reset link
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PasswordReset;
