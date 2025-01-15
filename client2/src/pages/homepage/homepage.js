import React from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import SideBarAndPromo from "../../components/sideBarAndPromo/Promo";
import FlashSales from "../../components/flashSales/FlashSales";
import TopHeader from "../../components/topHeader/TopHeader";
import ViewAllProducts from "../../components/viewAllProducts/viewAll";
import Line6 from "../../assets/line6.png";
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
      <img src={Line6} alt="Line" style={{ width: "100%", margin: "20px 0" }} />
      <CategorySection />
      <img src={Line6} alt="Line" style={{ width: "100%", margin: "20px 0" }} />
      <BestSellers />
      <OurProducts />
      <Footer />
    </div>
  );
};

export default Homepage;
