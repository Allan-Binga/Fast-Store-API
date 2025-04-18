import React, { useState, useEffect } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { backendAPI } from "../../endpoint";
import axios from "axios";

const BRANDS_ALLOWED = 4;

//FETCHING BRANDS FROM THE BACKEND
const getBrands = async () => {
  try {
    const response = await axios.get(`${backendAPI}/api/brands`);
    return response.data;
  } catch (error) {
    throw error.response.data.message;
  }
};

const ShopByBrand = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  //USE-EFFECT
  useEffect(() => {
    //FETCH BRAND ON COMPONENT MOUNT
    const fetchBrands = async () => {
      const data = await getBrands();
      setBrands(data);
    };
    fetchBrands();
  }, []);

  const visibleBrands = brands.slice(startIndex, startIndex + BRANDS_ALLOWED);

  const handleNext = () => {
    if (startIndex + BRANDS_ALLOWED < brands.length)
      setStartIndex((prevIndex) => prevIndex + BRANDS_ALLOWED);
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex((prevIndex) => prevIndex - BRANDS_ALLOWED);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 relative ml-4 mt-4 sm:ml-8 md:ml-12 lg:ml-[150px]">
      {/* Brands */}
      <div className="flex items-center gap-4">
        <div className="w-5">
          <div className="h-10 bg-blue-500" />
        </div>
        <div className="font-semibold text-secondary-2 text-[16px] tracking-[0.02em] leading-[1.5]">
          View Brands
        </div>
      </div>

      {/* Shop By Brand Header */}
      <div className="flex justify-between items-center w-full">
        <div className="text-text-2 font-semibold text-xl sm:text-2xl md:text-3xl lg:text-[36px] tracking-[0.02em] leading-[1.2]">
          Shop By Brand
        </div>
        <div className="flex items-center gap-4 mr-4 sm:mr-8 md:mr-12 lg:mr-[120px]">
          <FaArrowLeft
            className={`w-9 h-9 p-2 bg-gray-200 text-black rounded-full cursor-pointer ${
              startIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePrev}
          />
          <FaArrowRight
            className={`w-9 h-9 p-2 bg-gray-200 text-black rounded-full cursor-pointer ${
              startIndex + BRANDS_ALLOWED >= brands.length
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={handleNext}
          />
        </div>
      </div>

      {/* Brands Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {visibleBrands.map((brand) => (
          <div
            onClick={() => navigate(`/brand/${brand._id}/products`)}
            className="cursor-pointer"
            key={brand._id}
          >
            {/* Brand Image */}
            <div className="relative bg-white flex items-center justify-center overflow-hidden p-4">
              <div className="w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] md:w-[350px] md:h-[350px] lg:w-[390px] lg:h-[390px] bg-gray-100 rounded-full border border-gray-300 flex items-center justify-center aspect-square">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Brand Details */}
            <div className="p-6 flex flex-col gap-2 mt-auto">
              <h3 className="text-xl font-bold text-gray-800 text-center">
                {brand.name}
              </h3>
              <p className="text-lg text-gray-600 text-center">
                {brand.slogan}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopByBrand;
