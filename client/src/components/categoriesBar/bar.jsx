import React from "react";
import { Link } from "react-router-dom";
import "./bar.css";

const Bar = () => {
  const categories = [
    "Electronics",
    "Accessories",
    "Food",
    "Books",
    "Clothes",
    "Shoes",
    "Beauty/Health",
    "Sports",
    "Outdoor",
    "Home",
  ];
  return (
    <div className="categories-bar">
      {categories.map((category, index) => (
        <Link
          key={index}
          to={`/products/category/${encodeURIComponent(
            category.replace(/\s+/g, "-")
          )}`}
          className="category-link"
        >
          {category}
        </Link>
      ))}
    </div>
  );
};

export default Bar;
