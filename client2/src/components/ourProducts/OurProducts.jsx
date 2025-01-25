import React from "react";
import { CiHeart, CiShoppingCart } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "HAVIT HV-G92 Gamepad",
    price: "$120",
    originalPrice: "$160",
    discount: "-40%",
    rating: 4.5,
    reviews: 88,
    image:
      "https://d3d71ba2asa5oz.cloudfront.net/12003181/images/sam%20watch%204%2042mm%20blk.jpg",
  },
  {
    id: 2,
    name: "AK-900 Wired Keyboard",
    price: "$960",
    originalPrice: "$1160",
    discount: "-35%",
    rating: 4.7,
    reviews: 75,
    image:
      "https://d3d71ba2asa5oz.cloudfront.net/12003181/images/sam%20watch%204%2042mm%20blk.jpg",
  },
  {
    id: 3,
    name: "IPS LCD Gaming Monitor",
    price: "$370",
    originalPrice: "$490",
    discount: "-30%",
    rating: 4.9,
    reviews: 99,
    image:
      "https://d3d71ba2asa5oz.cloudfront.net/12003181/images/sam%20watch%204%2042mm%20blk.jpg",
  },
  {
    id: 4,
    name: "S-Series Comfort Chair",
    price: "$375",
    originalPrice: "$490",
    discount: "-25%",
    rating: 4.8,
    reviews: 99,
    image:
      "https://d3d71ba2asa5oz.cloudfront.net/12003181/images/sam%20watch%204%2042mm%20blk.jpg",
  },
  {
    id: 5,
    name: "S-Series Comfort Chair",
    price: "$375",
    originalPrice: "$490",
    discount: "-25%",
    rating: 4.8,
    reviews: 99,
    image:
      "https://d3d71ba2asa5oz.cloudfront.net/12003181/images/sam%20watch%204%2042mm%20blk.jpg",
  },
  // Additional products...
];

const BestSellers = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-start gap-4 relative ml-[150px] mt-[35px]">
      {/* Our Products Header */}
      <div className="flex items-center gap-4">
        <div className="w-5">
          <div className="h-10 bg-red-500" />
        </div>
        <div className="font-semibold text-secondary-2 text-[16px] tracking-[0.02em] leading-[1.5]">
          Our Products
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="text-text-2 font-semibold text-[36px] tracking-[0.02em] leading-[1.2]">
          Products
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-4 gap-6 mt-6 mr-20">
        {products.slice(0, 8).map((product) => (
          <div
            key={product.id}
            className="relative flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group"
          >
            {/* Discount Badge */}
            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold py-1 px-2 rounded">
              {product.discount}
            </div>
            {/* Heart Icon */}
            <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full text-black hover:bg-red-500 cursor-pointer">
              <CiHeart className="text-3xl" />
            </div>

            {/* Shopping Cart Icon */}
            <div className="absolute top-16 right-4 flex items-center justify-center w-10 h-10 rounded-full text-black hover:bg-red-500 cursor-pointer">
              <CiShoppingCart
                onClick={() => navigate("/cart")}
                className="text-3xl"
              />
            </div>

            {/* Product Image */}
            <div className="w-[400px] h-[300px] flex items-center justify-center overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="object-contain max-h-full max-w-full"
              />
            </div>
            {/* Product Details */}
            <div className="p-4 flex flex-col gap-2 mt-auto">
              <h3 className="text-lg font-bold text-gray-800">
                {product.name}
              </h3>
              <div className="text-sm text-red-600 font-bold">
                {product.price}
                <span className="text-gray-500 line-through">
                  {product.originalPrice}
                </span>
              </div>
              <div className="flex items-center text-sm text-yellow-500">
                {"★".repeat(Math.floor(product.rating))}
                {"☆".repeat(5 - Math.floor(product.rating))}{" "}
                <span className="ml-2 text-gray-500">
                  ({product.reviews} reviews)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestSellers;
