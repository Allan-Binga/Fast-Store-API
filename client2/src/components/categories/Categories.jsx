import React from "react";
import { CiCamera, CiHeadphones } from "react-icons/ci";
import { GiSmartphone } from "react-icons/gi";
import { HiOutlineComputerDesktop } from "react-icons/hi2";
import { GiLargeDress } from "react-icons/gi";

const Categories = () => {
  return (
    <div className="inline-flex flex-col items-start gap-4 relative ml-[300px] mt-[35px]">
      <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
        <div className="flex flex-col self-stretch my-auto w-5">
          <div className="flex shrink-0 h-10 bg-red-500 " />
        </div>
        <div className="relative w-fit font-semibold text-secondary-2 text-[16px] tracking-[0.02em] leading-[1.5] whitespace-nowrap">
          Categories
        </div>
      </div>
      <div className="relative w-full mb-[-8.00px] font-semibold text-text-2 text-[36px] tracking-[0.02em] leading-[1.2] whitespace-nowrap flex justify-between items-center">
        <div>Browse by category</div>
      </div>
      <div className="mt-4">
        <div className="font-semibold text-black text-[18px]">
          <div className="grid grid-cols-4 gap-4">
            <div
              className="w-[400px] h-[200px] bg-white text-black text-center flex items-center justify-center border border-gray-500 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer
"
            >
              <HiOutlineComputerDesktop className="text-black w-[40%] h-[40%]" />
            </div>
            <div
              className="w-[400px] h-[200px] bg-white text-black text-center flex items-center justify-center border border-gray-500 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer
"
            >
              <GiSmartphone className="text-black w-[40%] h-[40%]" />
            </div>
            <div
              className="w-[400px] h-[200px] bg-white text-black text-center flex items-center justify-center border border-gray-500 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer
"
            >
              <CiHeadphones className="text-black w-[40%] h-[40%]" />
            </div>
            <div
              className="w-[400px] h-[200px] bg-white text-black text-center flex items-center justify-center border border-gray-500 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer
"
            >
              <CiCamera className="text-black w-[40%] h-[40%]" />
            </div>
            <div
              className="w-[400px] h-[200px] bg-white text-black text-center flex items-center justify-center border border-gray-500 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer
"
            >
              <GiLargeDress className="text-black w-[40%] h-[40%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
