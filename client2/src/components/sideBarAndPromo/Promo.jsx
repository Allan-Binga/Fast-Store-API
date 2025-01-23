import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import HeroEnd from "./hero-end.png";
import HeroEnd2 from "./heroend2.png";
import AppleLogo from "./apple-logo.png";
import Line5 from "./line5.png";
// import Line2 from "./line2.png";
import { backendAPI } from "../../endpoint";
import axios from "axios";

const products = [
  {
    id: 1,
    image: HeroEnd,
    logo: AppleLogo,
    title: "iPhone 14 Pro",
    discount: "Up to 10% Discount",
  },
  {
    id: 2,
    image: HeroEnd,
    logo: AppleLogo,
    title: "MacBook Air",
    discount: "Up to 15% Discount",
  },
  {
    id: 3,
    image: HeroEnd2,
    logo: AppleLogo,
    title: "Apple Watch",
    discount: "Up to 20% Discount",
  },
];

const getCategories = async () => {
  try {
    const response = await axios.get(`${backendAPI}/api/products/categories`);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error.message);
  }
};

const SideBarAndPromo = () => {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProductIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 3000); // Change product every 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    //FETCH CATEGORIES ON COMPONENT MOUNT
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const currentProduct = products[currentProductIndex];

  return (
    <div className="flex mt-[25px]">
      <div className="inline-flex flex-col items-start relative ml-[150px]">
        <div className="overflow-y-auto max-h-[390px] w-[200px] scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 scrollbar-track-rounded">
          {categories.length > 0 ? (
            categories.slice(0, categories.length).map((category, index) => (
              <div
                key={index}
                className="relative w-fit font-normal text-black text-[16px] text-center tracking-[0.02em] leading-[1.5] whitespace-nowrap hover:bg-blue-300 hover:text-white cursor-pointer px-2 py-1 rounded-full"
              >
                {category.name || category}
              </div>
            ))
          ) : (
            <div>Loading categories...</div>
          )}
        </div>
      </div>
      {/* <div className="w-px h-96 bg- mx-8">
        <img alt="line2" className="fixed w-px h-96 top-0 left-0" src={Line2} />
      </div> */}
      <div className="w-[1000px] h-[400px] bg-black p-4 flex flex-col items-center justify-center ml-auto mr-[500px]">
        <div className="relative w-full h-[344px] bg-black rounded-lg overflow-hidden">
          <div className="absolute inset-0">
            <img
              className="absolute w-[539px] h-[328px] right-0 bottom-0 object-cover"
              alt="Hero endframe"
              src={currentProduct.image}
            />
          </div>
          <p className="absolute w-[294px] top-[110px] left-0 font-semibold text-white text-[48px] tracking-[0.02em] leading-[1.2]">
            {currentProduct.discount}
          </p>

          <div className="absolute top-4 left-4 flex items-center space-x-4">
            <img
              className="relative w-10 h-[49px]"
              alt="Apple Logo"
              src={currentProduct.logo}
            />
            <div className="relative w-[126px] h-5 font-normal text-white text-[18px] text-center tracking-[0.02em] leading-[1.5] whitespace-nowrap">
              {currentProduct.title}
            </div>
          </div>
          <div className="inline-flex items-center gap-2 absolute top-[253px] left-[3px]">
            <div className="inline-flex flex-col items-start gap-1 relative flex-[0_0_auto]">
              <div className="relative w-fit mt-[-1px] font-medium text-black text-[16px] text-center tracking-[0.02em] leading-[1.5] whitespace-nowrap text-white">
                Shop Now
              </div>
              <img
                className="relative w-[81px] h-px object-cover"
                alt="Line"
                src={Line5}
              />
            </div>
            <FaArrowRight className="!relative !w-6 !h-6" color="#FAFAFA" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBarAndPromo;
