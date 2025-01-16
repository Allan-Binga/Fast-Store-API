import React from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import SideBarAndPromo from "../../components/sideBarAndPromo/Promo";
import FlashSales from "../../components/flashSales/FlashSales";
import TopHeader from "../../components/topHeader/TopHeader";
import ViewAllProducts from "../../components/viewAllProducts/viewAll";
import CategorySection from "../../components/categories/Categories";
import BestSellers from "../../components/bestSelling/BestSelling";
import OurProducts from "../../components/ourProducts/OurProducts";

const Homepage = () => {
  return (
    <div>
      <TopHeader />
      <Header />
      <SideBarAndPromo />
      <FlashSales />
      <ViewAllProducts />
      <CategorySection />
      <BestSellers />
      <OurProducts />
      <Footer />
    </div>
  );
};

export default Homepage;
