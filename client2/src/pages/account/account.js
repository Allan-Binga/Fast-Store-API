import React, { useState } from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { BsFillCartCheckFill } from "react-icons/bs";
import { RiUserLocationFill, RiLockPasswordFill } from "react-icons/ri";
import { FaUser } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import { MdReviews } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";

const Account = () => {
  const [activeSection, setActiveSection] = useState("My Orders");

  return (
    <div className="flex flex-col min-h-screen">
      <TopHeader />
      <Header />
      <div className="flex-1 p-4">
        <div className="flex items-center gap-4">
          <div className="w-6">
            <div className="h-10 bg-blue-500" />
          </div>
          <div className="font-semibold text-secondary-2 text-[46px] tracking-[0.02em] leading-[1.5]">
            Account
          </div>
        </div>

        {/* Center Content */}
        <div className="flex justify-center mt-4">
          <div className="w-3/4 h-[700px] bg-gray-50 rounded-lg shadow-md flex p-6">
            {/* Left Section */}
            <div className="w-1/4 bg-gray-50 p-6 rounded-l-lg flex flex-col gap-6 mt-20">
              <button
                className={`text-lg font-medium flex items-center gap-3 ${
                  activeSection === "My Orders"
                    ? "text-blue-500"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveSection("My Orders")}
              >
                <BsFillCartCheckFill /> <span>My Orders</span>
              </button>

              <button
                className={`text-lg font-medium flex items-center gap-3 ${
                  activeSection === "Address"
                    ? "text-blue-500"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveSection("Address")}
              >
                <RiUserLocationFill /> <span>Address</span>
              </button>
              <button className="text-lg font-medium flex items-center gap-3 text-gray-600">
                <FaUser /> <span>Personal Information</span>
              </button>
              <button className="text-lg font-medium flex items-center gap-3 text-gray-600">
                <FaHeart /> <span>Wishlist</span>
              </button>
              <button className="text-lg font-medium flex items-center gap-3 text-gray-600">
                <MdReviews /> <span>Reviews</span>
              </button>
              <button className="text-lg font-medium flex items-center gap-3 text-gray-600">
                <RiLockPasswordFill /> <span>Update Password</span>
              </button>
              <button className="text-lg font-medium flex items-center gap-3 text-gray-600">
                <IoLogOut /> <span>Logout</span>
              </button>
            </div>

            {/* Separator */}
            <div className="w-[2px] h-auto bg-gray-400 mx-6"></div>

            {/* Right Section */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-lg font-semibold">
                Hello John, Welcome to your profile.
              </p>
              {/*ORDERS*/}
              {activeSection === "My Orders" && (
                <div className="flex gap-6 mt-6">
                  <div className="w-[300px] h-[150px] p-6 rounded-lg bg-gray-300 flex flex-col justify-center items-start">
                    <h2 className="text-lg font-semibold">All Orders</h2>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <div className="w-[300px] h-[150px] p-6 rounded-lg bg-gray-300 flex flex-col justify-center items-start">
                    <h2 className="text-lg font-semibold">Total Deliveries</h2>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                </div>
              )}

              {/*ADDRESS*/}
              {activeSection === "Address" && (
                <div className="w-[300px] h-[150px] p-6 rounded-lg bg-gray-300 flex flex-col justify-center items-start mt-6">
                  <h2 className="text-lg font-semibold">Address</h2>
                  <p className="text-gray-700">123 Main St, New York</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
