import React from "react";
import "./topheader.css";
import { IoIosArrowDropdown } from "react-icons/io";

const TopHeader = () => {
  return (
    <div className="top-header">
      <div className="top-header-container">
        <div className="announcement-bar">
          <p className="announcement-text">
            Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!
          </p>

          <div className="shop-now-button">Shop Now</div>
        </div>

        <div className="language-selector">
          <div className="selected-language">English</div>

          <IoIosArrowDropdown className="dropdown-icon" color="white" />
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
