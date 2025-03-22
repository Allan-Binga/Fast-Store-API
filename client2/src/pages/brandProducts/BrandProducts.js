import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { backendAPI } from "../../endpoint";
import axios from "axios";
import { CiHeart, CiShoppingCart } from "react-icons/ci";

// API service
const getBrandProducts = async (id) => {
  try {
    const response = await axios.get(`${backendAPI}/api/brands/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const BrandProducts = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [brand, setBrand] = useState(null);

  useEffect(() => {
    getBrandProducts(id).then(data => setBrand(data));
  }, [id]);

  return (
    <div className="flex flex-col min-h-screen">
      <TopHeader />
      <Header />
      <div className="flex-grow ml-[150px]">
        <div className="flex items-center gap-3 mt-4 ml-4">
          <div className="w-6">
            <div className="h-10 bg-blue-500" />
          </div>
          <div className="font-semibold text-secondary-2 text-[46px] tracking-[0.02em] leading-[1.5]">
            {brand ? brand.name : "Loading..."}
          </div>
        </div>
        {/* Brand Products Card */}
        <div className="grid grid-cols-4 gap-6 mt-6 mr-20">
          {brand && brand.products.length > 0 ? (
            brand.products.map((product) => (
              <div
                key={product._id}
                className="relative flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group"
              >
                {/* Discount Badge */}
                {product.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-blue-500 text-white text-sm font-bold py-1 px-2 rounded">
                    {product.discount}%
                  </div>
                )}

                {/* Heart Icon */}
                <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full text-black hover:bg-blue-500 cursor-pointer">
                  <CiHeart className="text-3xl" />
                </div>

                {/* Shopping Cart Icon */}
                <div className="absolute top-16 right-4 flex items-center justify-center w-10 h-10 rounded-full text-black hover:bg-blue-500 cursor-pointer">
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
                  <div className="text-sm text-blue-600 font-bold">
                    ${product.currentPrice}{" "}
                    {product.discount > 0 && (
                      <span className="text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No products found for this brand.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrandProducts;