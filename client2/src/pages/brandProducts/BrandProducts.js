import React, { useState, useEffect } from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { backendAPI } from "../../endpoint";
import axios from "axios";

const BrandProducts = () => {
  const [brandProducts, setBrandProducts] = useState([]);

  //Fetch brand products
  const getBrandProducts = async () => {
    try {
      const response = await axios.get(`${backendAPI}/api/brands`);
      return response.data;
    } catch (error) {
      throw error.response.data.message;
    }
  };

  //useEffect
  useEffect(() => {
    const fetchBrandProducts = async () => {
      const data = await getBrandProducts();
      setBrandProducts(data);
    };
    fetchBrandProducts();
  }, []);

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
            {brandProducts.length > 0 ? brandProducts[0].name : "Loading..."}{" "}
            Products
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default BrandProducts;
