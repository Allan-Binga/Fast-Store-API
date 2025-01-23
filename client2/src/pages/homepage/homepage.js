import React, { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import SideBarAndPromo from "../../components/sideBarAndPromo/Promo";
import FlashSales from "../../components/flashSales/FlashSales";
import TopHeader from "../../components/topHeader/TopHeader";
import ViewAllProducts from "../../components/viewAllProducts/viewAll";
import CategorySection from "../../components/categories/Categories";
import BestSellers from "../../components/bestSelling/Bestsellers";
import OurProducts from "../../components/ourProducts/OurProducts";
import Deal from "../../components/superDeal/deal";
import Customer from "../../components/customer/customer";
import ShopByBrand from "../../components/shopByBrand/shopByBrand";

const Homepage = () => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Simulate a loading state that ends after 2 seconds (you can adjust this)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []);
  return (
    <div>
      <TopHeader />
      <Header />
       {/* Progress Bar */}
       {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-800">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${isLoading}%` }}
          ></div>
        </div>
      )}
      <SideBarAndPromo />
      <FlashSales />
      <ShopByBrand/>
      <CategorySection />
      <BestSellers />
      <Deal />
      <OurProducts />
      <ViewAllProducts />
      <Customer />
      <Footer />
    </div>
  );
};

export default Homepage;
