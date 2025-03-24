import React, { useState } from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updatePassword = (e) => {
    e.preventDefault();
    console.log("Password updated successfully");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopHeader />
      <Header />
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-2xl mt-4 bg-white p-8 rounded-xl shadow-xl border">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
            Reset Password
          </h2>

          <form className="space-y-6" onSubmit={updatePassword}>
            <div>
              <label htmlFor="currentPassword" className="block text-base font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-base font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-700 mb-2">
                Re-Enter Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChangePassword;
