import React, { useState, useEffect } from "react";
import { CiCamera, CiHeadphones } from "react-icons/ci";
import { GiSmartphone } from "react-icons/gi";
import { HiOutlineComputerDesktop } from "react-icons/hi2";
import { GiLargeDress, GiBookshelf, GiConverseShoe } from "react-icons/gi";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { PiShirtFolded } from "react-icons/pi";
import { IoFastFoodOutline, IoGameControllerOutline } from "react-icons/io5";
import { GiNecklaceDisplay } from "react-icons/gi";
import { MdShapeLine } from "react-icons/md";
import { MdDevices } from "react-icons/md";
import { backendAPI } from "../../endpoint";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CATEGORIES_ALLOWED = 4; // Number of categories visible at a time
const categoryIcons = {
  Accessories: <MdShapeLine size={64}/>,
  Electronics: <MdDevices size={64}/>,
  Computers: <HiOutlineComputerDesktop size={64} />,
  Smartphones: <GiSmartphone size={64} />,
  Headphones: <CiHeadphones size={64} />,
  Cameras: <CiCamera size={64} />,
  "Women's Clothing": <GiLargeDress size={64} />,
  "Men's Clothing": <PiShirtFolded size={64} />,
  Food: <IoFastFoodOutline size={64} />,
  Jewelery: <GiNecklaceDisplay size={64} />,
  "Gaming Consoles": <IoGameControllerOutline size={64} />,
  Books: <GiBookshelf size={64} />,
  Sneakers: <GiConverseShoe size={64} />,
};

const Categories = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([]);
  const [startIndex, setStartIndex] = React.useState(0);
 

  //Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendAPI}/api/categories/all`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  //Category click
  const categoryClick = (category) => {
    const formattedCategory = encodeURIComponent(category.toLowerCase())
    navigate(`/categories/${formattedCategory}`)
  }

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
        {visibleCategories.map((category, index) => (
          <div
            key={index}
            className="w-[400px] h-[360px] bg-white text-black flex flex-col items-center justify-center border border-gray-500 hover:bg-blue-400 hover:text-white transition-all duration-300 cursor-pointer "
            onClick={() => categoryClick(category)}
          >
            {categoryIcons[category] || <span>🛍️</span>}
            <p className="mt-2 font-medium">{category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
