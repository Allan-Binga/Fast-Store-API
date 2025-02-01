import React from "react";
import { CiCamera, CiHeadphones } from "react-icons/ci";
import { GiSmartphone } from "react-icons/gi";
import { HiOutlineComputerDesktop } from "react-icons/hi2";
import { GiLargeDress, GiBookshelf, GiConverseShoe } from "react-icons/gi";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { PiShirtFolded } from "react-icons/pi";
import { IoFastFoodOutline, IoGameControllerOutline } from "react-icons/io5";
import { GiNecklaceDisplay } from "react-icons/gi";

const CATEGORIES_ALLOWED = 4; // Number of categories visible at a time
const categories = [
  { id: 1, icon: <HiOutlineComputerDesktop size={64} />, name: "Computers" },
  { id: 2, icon: <GiSmartphone size={64} />, name: "Smartphones" },
  { id: 3, icon: <CiHeadphones size={64} />, name: "Headphones" },
  { id: 4, icon: <CiCamera size={64} />, name: "Cameras" },
  { id: 5, icon: <GiLargeDress size={64} />, name: "Women's Fashion" },
  { id: 6, icon: <PiShirtFolded size={64} />, name: "Men's Fashion" },
  { id: 7, icon: <IoFastFoodOutline size={64} />, name: "Food" },
  { id: 8, icon: <GiNecklaceDisplay size={64} />, name: "Jewelery" },
  {
    id: 9,
    icon: <IoGameControllerOutline size={64} />,
    name: "Gaming Consoles",
  },
  { id: 10, icon: <GiBookshelf size={64} />, name: "Books" },
  { id: 11, icon: <GiConverseShoe size={64} />, name: "Footwear" },
];

const Categories = () => {
  const [startIndex, setStartIndex] = React.useState(0);

  // Calculate visible categories
  const visibleCategories = categories.slice(
    startIndex,
    startIndex + CATEGORIES_ALLOWED
  );

  // Handle the "Next" button click
  const handleNext = () => {
    if (startIndex + CATEGORIES_ALLOWED < categories.length) {
      setStartIndex((prevIndex) => prevIndex + CATEGORIES_ALLOWED);
    }
  };

  // Handle the "Previous" button click
  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex((prevIndex) => prevIndex - CATEGORIES_ALLOWED);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 relative ml-[150px] mt-[35px]">
      <div className="flex gap-4">
        <div className="w-5">
          <div className="h-10 bg-blue-500" />
        </div>
        <div className="font-semibold text-secondary-2 text-[16px] tracking-[0.02em] leading-[1.5] mt-2">
          Categories
        </div>
      </div>
      <div className="flex justify-between items-center w-full mr-20">
        <div className="text-text-2 font-semibold text-[36px] tracking-[0.02em] leading-[1.2]">
          Browse by category
        </div>
        <div className="flex items-center gap-4 mr-[120px]">
          <FaArrowLeft
            className={`w-9 h-9 p-2 bg-gray-200 text-black rounded-full cursor-pointer ${
              startIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePrev}
          />
          <FaArrowRight
            className={`w-9 h-9 p-2 bg-gray-200 text-black rounded-full cursor-pointer  ${
              startIndex + CATEGORIES_ALLOWED >= categories.length
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={handleNext}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mt-6 mr-20">
        {visibleCategories.map((category) => (
          <div
            key={category.id}
            className="w-[400px] h-[360px] bg-white text-black flex flex-col items-center justify-center border border-gray-500 hover:bg-blue-400 hover:text-white transition-all duration-300 cursor-pointer "
          >
            {category.icon}
            <p className="mt-2 font-medium">{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
