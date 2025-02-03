import React, { useState, useEffect } from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { BsFillCartCheckFill } from "react-icons/bs";
import { RiUserLocationFill, RiLockPasswordFill } from "react-icons/ri";
import { FaUser } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import { MdReviews } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import { backendAPI } from "../../endpoint";
import axios from "axios";

const Account = () => {
  const [activeSection, setActiveSection] = useState("My Orders");
  const [addresses, setAddresses] = useState([]);

  //Fetch addresses
  const getAddresses = async () => {
    try {
      const response = await axios.get(`${backendAPI}/api/address/user`);
      return response.data;
    } catch (error) {
      throw error.response.data.message;
    }
  };

  //useEffect
  useEffect(() => {
    const fetchAddresses = async () => {
      const data = await getAddresses();
      setAddresses(data);
    };
    fetchAddresses();
  }, []);

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
          <div className="w-4/5 h-[1100px] bg-gray-50 rounded-lg shadow-md flex p-6">
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
              <button
                className={`text-lg font-medium flex items-center gap-3 ${
                  activeSection === "Account details"
                    ? "text-blue-500"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveSection("Account details")}
              >
                <FaUser /> <span>Account details</span>
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
              {/*ORDERS*/}
              {activeSection === "My Orders" && (
                <div className="flex gap-6 mt-6">
                  <p className="text-lg font-semibold">
                    Hello John, Welcome to your profile.
                  </p>
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

              {/* ADDRESS */}
              {activeSection === "Address" && (
                <div className="w-full">
                  <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors duration-200 mb-4">
                    Add address
                  </button>

                  <div className="grid grid-cols-2 gap-6">
                    {addresses.map((address, index) => (
                      <div
                        key={index}
                        className="w-[500px] h-auto p-6 rounded-lg bg-white shadow-lg"
                      >
                        <h2 className="text-xl font-bold mb-4 text-gray-800">
                          Address {index + 1}
                        </h2>
                        <div className="w-full">
                          <div className="mb-4 flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-900 w-1/3">
                              First Name
                            </label>
                            <p className="text-gray-900 w-2/3 text-right">
                              {address.firstName}
                            </p>
                          </div>
                          <div className="mb-4 flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-900 w-1/3">
                              Last Name
                            </label>
                            <p className="text-gray-900 w-2/3 text-right">
                              {address.lastName}
                            </p>
                          </div>
                          <div className="mb-4 flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-900 w-1/3">
                              Email
                            </label>
                            <p className="text-gray-900 w-2/3 text-right">
                              {address.email}
                            </p>
                          </div>
                          <div className="mb-4 flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-900 w-1/3">
                              Street Address
                            </label>
                            <p className="text-gray-900 w-2/3 text-right">
                              {address.street}
                            </p>
                          </div>
                          <div className="mb-4 flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-900 w-1/3">
                              City
                            </label>
                            <p className="text-gray-900 w-2/3 text-right">
                              {address.city}
                            </p>
                          </div>
                          <div className="mb-4 flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-900 w-1/3">
                              State/Province
                            </label>
                            <p className="text-gray-900 w-2/3 text-right">
                              {address.state}
                            </p>
                          </div>
                          <div className="mb-4 flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-900 w-1/3">
                              Postal Code
                            </label>
                            <p className="text-gray-900 w-2/3 text-right">
                              {address.postalCode}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-start space-x-4 mt-4">
                          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200">
                            Edit Address
                          </button>
                          <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200">
                            Delete Address
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACCOUNT DETAILS */}
              {activeSection === "Account details" && (
                <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Account Details
                  </h2>

                  <div className="space-y-4">
                    {/* First Name */}
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-900 w-1/3">
                        First Name
                      </label>
                      <p className="text-gray-900 w-2/3 text-right">
                        Allan
                      </p>
                    </div>

                    {/* Last Name */}
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-900 w-1/3">
                        Last Name
                      </label>
                      <p className="text-gray-900 w-2/3 text-right">
                      bINGA
                      </p>
                    </div>

                    {/* Email */}
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-900 w-1/3">
                        Email
                      </label>
                      <p className="text-gray-900 w-2/3 text-right">
                        allanbinga73@gmail.com
                      </p>
                    </div>

                    {/* Phone Number */}
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-900 w-1/3">
                        Phone Number
                      </label>
                      <p className="text-gray-900 w-2/3 text-right">
                        +1254712519615
                      </p>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="mt-6 flex justify-start">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200">
                      Edit Details
                    </button>
                  </div>
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
