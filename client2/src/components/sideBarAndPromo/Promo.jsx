import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import HeroEnd from "./hero-end.png";
import HeroEnd2 from "./heroend2.png"
import AppleLogo from "./apple-logo.png";
import Line5 from "./line5.png";
import Line2 from "./line2.png";

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

const SideBarAndPromo = () => {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProductIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 3000); // Change product every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const currentProduct = products[currentProductIndex];

  return (
    <div className="flex mt-[25px]">
      <div className="inline-flex flex-col items-start gap-4 relative ml-[150px]">
        <div className="gap-[51px] inline-flex items-start relative flex-[0_0_auto]">
          <div className="relative w-fit mt-[-1.00px] font-normal text-black text-[16px] text-center tracking-[0.02em] leading-[1.5] whitespace-nowrap">
            Woman’s Fashion
          </div>
          <IoIosArrowForward className="!relative !w-7 !h-7" />
        </div>
        <div className="gap-[81px] inline-flex items-start relative flex-[0_0_auto]">
          <div className="relative w-fit mt-[-1.00px] font-normal text-black text-[16px] text-center tracking-[0.02em] leading-[1.5] whitespace-nowrap">
            Men’s Fashion
          </div>
          <IoIosArrowForward className="!relative !w-7 !h-7" />
        </div>
        <div className="relative w-fit font-normal text-black text-[16px] text-center tracking-[0.02em] leading-[1.5] whitespace-nowrap">
          Electronics
        </div>
        <div className="relative w-fit font-normal text-black text-[16px] text-center tracking-[0.02em] leading-[1.5] whitespace-nowrap">
          Home &amp; Lifestyle
        </div>
        <div className="relative w-fit font-normal text-black text-[16px] text-center tracking-[0.02em] leading-[1.5] whitespace-nowrap">
          Medicine
        </div>
        <div className="relative w-fit font-normal text-black text-[16px] text-center tracking-[0.02em] leading-[1.5] whitespace-nowrap">
          Sports &amp; Outdoor
        </div>
        <div className="relative w-fit font-normal text-black text-[16px] text-center tracking-[0.02em] leading-[1.5] whitespace-nowrap">
          Baby’s &amp; Toys
        </div>
        <div className="relative w-fit font-normal text-black text-[16px] text-center tracking-[0.02em] leading-[1.5] whitespace-nowrap">
          Groceries &amp; Pets
        </div>
        <div className="relative w-fit font-normal text-black text-[16px] text-center tracking-[0.02em] leading-[1.5] whitespace-nowrap">
          Health &amp; Beauty
        </div>
      </div>
      <div className="w-px h-96 bg-black mx-8">
        <img alt="line2" className="fixed w-px h-96 top-0 left-0" src={Line2} />
      </div>
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
