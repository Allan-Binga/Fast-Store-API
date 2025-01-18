import React from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";

const FlashSales = () => {
  // Sample product data with image URLs
  const products = [
    {
      id: 1,
      name: "Product 1",
      price: "$19.99",
      image:
        "https://d3d71ba2asa5oz.cloudfront.net/12003181/images/sam%20watch%204%2042mm%20blk.jpg",
    },
    {
      id: 2,
      name: "Product 2",
      price: "$29.99",
      image:
        "https://d3d71ba2asa5oz.cloudfront.net/12003181/images/sam%20watch%204%2042mm%20blk.jpg",
    },
    {
      id: 3,
      name: "Product 3",
      price: "$39.99",
      image:
        "https://d3d71ba2asa5oz.cloudfront.net/12003181/images/sam%20watch%204%2042mm%20blk.jpg",
    },
    {
      id: 4,
      name: "Product 4",
      price: "$49.99",
      image:
        "https://d3d71ba2asa5oz.cloudfront.net/12003181/images/sam%20watch%204%2042mm%20blk.jpg",
    },
    {
      id: 5,
      name: "Product 5",
      price: "$59.99",
      image:
        "https://d3d71ba2asa5oz.cloudfront.net/12003181/images/sam%20watch%204%2042mm%20blk.jpg",
    },
  ];

  return (
    <div className="flex flex-col items-start gap-4 relative ml-[300px] mt-[35px]">
      <div className="flex gap-4">
        <div className="w-5">
          <div className="h-10 bg-red-500" />
        </div>
        <div className="font-semibold text-secondary-2 text-[16px] tracking-[0.02em] leading-[1.5]">
          Flash Sales
        </div>
      </div>
      <div className="flex justify-between items-center w-full">
        <div className="text-text-2 font-semibold text-[36px] tracking-[0.02em] leading-[1.2]">
          Explore Today's Deals
        </div>
        <div className="flex items-center gap-4 mr-[320px]">
          <FaArrowLeft />
          <FaArrowRight />
        </div>
      </div>

      {/* Flash Sale Products */}
      <div className="flex gap-6 mt-6 overflow-x-auto pb-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="group flex-shrink-0 w-[300px] h-[420px] bg-white rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center relative transform hover:scale-105"
          >
            {/* Heart Icon */}
            <div className="absolute top-4 right-4 text-3xl text-gray-500 hover:text-red-600 cursor-pointer transition-colors duration-300">
              <CiHeart />
            </div>
            {/* Product Image */}
            <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-lg">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain mt-5"
              />
            </div>
            <div className="text-lg font-semibold mt-4 mb-2 text-gray-800">
              {product.name}
            </div>
            <div className="text-md text-red-600 font-bold">
              {product.price}
            </div>

            {/* Add to Cart Button (visible on hover) */}
            <button className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashSales;
