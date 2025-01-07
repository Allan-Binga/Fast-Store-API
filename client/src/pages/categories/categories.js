import React, { useEffect, useState } from "react";
import { getAllCategories } from "../../api/categories";
import "./categories.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import Bar from "../../components/categoriesBar/bar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../../components/spinner/spinner";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true); //show spinner
        const categoriesData = await getAllCategories();
        const uniqueCategories = Array.from(
          new Set(categoriesData.map((cat) => cat.toLowerCase()))
        ).map(
          (cat) => cat.charAt(0).toUpperCase() + cat.slice(1) // Capitalize first letter
        );
        setCategories(uniqueCategories);
      } catch (error) {
        toast.error("Error fetching categories.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="page-container">
      <Navbar />
      <Bar />
      <div className="content-wrapper">
        <div className="content">
          <div className="categories-container">
            <h1 className="categories-title">Categories</h1>
            {isLoading ? (
              <Spinner /> // Use the reusable spinner
            ) : (
              <div className="categories-grid">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="category-card"
                    onClick={() => navigate(`/products/category/${category}`)}
                  >
                    <h2 className="category-name">{category}</h2>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Categories;
