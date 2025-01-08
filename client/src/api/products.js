import axios from "axios";

const API_URL = "http://localhost:5500/api/products";

//GET THE PRODUCTS
export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
  } catch (error) {
    throw error.response.data.message;
  }
};

//ADD NEW PRODUCT
export const addProduct = async (productsData) => {
  try {
    await axios.post(`${API_URL}/`, productsData);
  } catch (error) {
    throw (
      error.response?.data?.message || "An error occured while adding product."
    );
  }
};

// GET A SINGLE PRODUCT
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error fetching the product";
  }
};

//UPDATE PRODUCT
export const updateProduct = async (id, updatedProductData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedProductData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error fetching the product";
  }
};

//DELETE PRODUCT
export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error deleting product.";
  }
};
