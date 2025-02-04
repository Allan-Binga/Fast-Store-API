import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { backendAPI } from "../../endpoint";
import axios from "axios";

const BrandProducts = () => {
  const { id } = useParams(); // Get brand ID from URL
  const [brand, setBrand] = useState(null);

  // Fetch brand details including populated products
  const getBrandProducts = async () => {
    try {
      const response = await axios.get(`${backendAPI}/api/brands/${id}`); // Fetch a specific brand
      setBrand(response.data);
    } catch (error) {
      console.error(error);
      setBrand(null);
    }
  };

  useEffect(() => {
    getBrandProducts();
  }, [id]); // Fetch when ID changes

  return (
    <div className="flex flex-col min-h-screen">
      <TopHeader />
      <Header />
      <div className="flex-grow">
        <div className="flex items-center gap-3 mt-4 ml-4">
          <div className="w-6">
            <div className="h-10 bg-blue-500" />
          </div>
          <div className="font-semibold text-secondary-2 text-[46px] tracking-[0.02em] leading-[1.5]">
            {brand ? brand.name : "Loading..."} Products
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 p-4">
          {brand && brand.products.length > 0 ? (
            brand.products.map((product) => (
              <div key={product._id} className="p-4 border rounded shadow-md">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-md"
                />
                <h3 className="mt-2 text-lg font-bold">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
                <p className="mt-1 text-green-600 font-semibold">
                  ${product.currentPrice}
                </p>
                {product.discount > 0 && (
                  <p className="text-red-500 line-through">
                    ${product.originalPrice}
                  </p>
                )}
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
