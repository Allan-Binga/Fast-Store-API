import axios from "axios";

const API_URL = "http://localhost:5500/api/products";

//GET ALL CATEGORIES
export const getAllCategories = async (categoriesData) => {
  try {
    const respone = await axios.get(`${API_URL}/categories`, categoriesData);
    return respone.data;
  } catch (error) {
    throw error.response.data.message;
  }
};

//GET PRODUCTS IN A CATEGORY

export const getProductsInACategory = async (categoryName) => {
    try {
        const respone = await axios.get(`${API_URL}/category/${categoryName}`)
        return respone.data
    } catch (error) {
        throw error;
    }
}