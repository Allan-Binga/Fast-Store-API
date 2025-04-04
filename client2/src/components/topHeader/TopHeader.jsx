import React from "react";
import { IoIosArrowDropdown } from "react-icons/io";

const TopHeader = () => {
  return (
    <div className="bg-blue-950 h-12 w-full flex justify-center items-center">
      <div className="flex justify-between items-center w-full max-w-6xl px-5">
        <div className="flex items-center justify-center w-full">
          <p className="text-white text-sm text-center mr-5">
            Exclusive Summer Sale for Swim Suits. Get up to 50% off!
          </p>
          <button className="bg-primary text-white px-3 py-1 rounded cursor-pointer hover:bg-opacity-80">
            Shop Now
          </button>
        </div>
        <div className="flex items-center cursor-pointer">
          <span className="text-white mr-1">English</span>
          <IoIosArrowDropdown className="text-white text-lg" />
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
