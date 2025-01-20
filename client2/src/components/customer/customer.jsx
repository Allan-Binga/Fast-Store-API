import React from "react";
import { TbTruckDelivery } from "react-icons/tb";
import { IoShieldCheckmark } from "react-icons/io5";
import { RiCustomerServiceFill } from "react-icons/ri";

const Customer = () => {
  return (
    <div className="flex items-center bg-white py-10 ml-[500px]">
      <div className="flex flex-col items-center text-center max-w-xs bg-white p-6">
        <div className="flex justify-center items-center w-16 h-16 rounded-full bg-gray-200 mb-4">
          <TbTruckDelivery className="text-3xl text-gray-700" />
        </div>
        <h3 className="text-lg font-bold text-black mb-2">
          FREE AND FAST DELIVERY
        </h3>
        <p className="text-sm text-black">
          Free delivery for all orders over $140
        </p>
      </div>

      <div className="flex flex-col items-center text-center max-w-xs bg-white p-6">
        <div className="flex justify-center items-center w-16 h-16 rounded-full bg-gray-200 mb-4">
          <RiCustomerServiceFill className="text-3xl text-gray-700" />
        </div>
        <h3 className="text-lg font-bold text-black mb-2">
          24/7 CUSTOMER SERVICE
        </h3>
        <p className="text-sm text-black">Friendly 24/7 customer support</p>
      </div>

      <div className="flex flex-col items-center text-center max-w-xs bg-white p-6">
        <div className="flex justify-center items-center w-16 h-16 rounded-full bg-gray-200 mb-4">
          <IoShieldCheckmark className="text-3xl text-gray-700" />
        </div>
        <h3 className="text-lg font-bold text-black mb-2">
          MONEY BACK GUARANTEE
        </h3>
        <p className="text-sm text-black">We return money within 30 days</p>
      </div>
    </div>
  );
};

export default Customer;
