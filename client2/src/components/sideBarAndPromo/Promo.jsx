import React from "react";
import "./promo.css";
import { FaArrowRight } from "react-icons/fa";
import Apple from "./apple.png";
import Line5 from "./line5.png";
import Line2 from "./line2.png";
import Iphone from './iphone.jpeg'
import { IoIosArrowForward } from "react-icons/io";

const SideBarAndPromo = () => {
  return (
    <div className="categories-and-promo">
      <div className="categories">
        <div className="categories-section">
          Men's Fashion
          <IoIosArrowForward className="drop-down" />
        </div>
        <div className="categories-section">
          Women's Fashion <IoIosArrowForward className="drop-down" />
        </div>
        <div className="categories-section">Electronics</div>
        <div className="categories-section">Home & Lifestyle</div>
        <div className="categories-section">Medicine</div>
        <div className="categories-section">Sports & Outdoor</div>
        <div className="categories-section">Baby's & Toys</div>
        <div className="categories-section">Groceries & Pets</div>
        <div className="categories-section">Health & Beauty</div>
      </div>
      <img src={Line2} alt="line2" className="line-2" />
      <div className="frame">
        <div className="overlap">
          <div className="overlap-group">
            <div className="div">
              <img className="hero-img" alt="hero-img" src={Iphone} />
              <div className="div-2">
                <div className="ellipse" />
                <div className="ellipse" />
                <div className="group">
                  <div className="overlap-group-2">
                    <div className="ellipse-2" />
                    <div className="ellipse-3" />
                  </div>
                </div>
                <div className="ellipse" />
                <div className="ellipse" />
              </div>
            </div>
            <p className="text-wrapper">Up to 75% off!</p>
          </div>
          <div className="div-3">
            <img className="element-apple-gray" alt="apple-gray" src={Apple} />
            <div className="text-wrapper-2">iPhone 14 Pro Max</div>
          </div>
          <div className="div-4">
            <div className="div-5">
              <div className="text-wrapper-3">Shop Now</div>
              <img className="line-5" alt="line" src={Line5} />
            </div>
            <FaArrowRight className="icons-arrow-right" color="#FAFAFA" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBarAndPromo;
