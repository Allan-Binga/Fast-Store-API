import axios from "axios";

const API_URL = "http://localhost:5500/api/carts";

//GET THE CARTS
export const getCarts = async (cartsData) => {
  try {
    const respone = await axios.get(`${API_URL}/`, cartsData);
    return respone.data;
  } catch (error) {
    throw error.response.data.message;
  }
};

// GET A SINGLE CART
export const getCartById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error fetching the product";
  }
};

//ADD NEW CART
export const addCart = async (cartsData) => {
  try {
    const response = await axios.post(`${API_URL}/`, cartsData);
  } catch (error) {
    throw (
      error.response?.data?.message || "An error occured while adding cart."
    );
  }
};

//UPDATE  CART
export const updateCart = async (id, updatedCartData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedCartData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error fetching the product";
  }
};

//DELETE CART
export const deleteCart = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error deleting product.";
  }
};
