import axios from "axios";

const API_URL = "http://localhost:5500/api/products";

//ADD A PRODUCT TO CART
export const addProductToCart = async (userId, productId, quantity, price) => {
  try {
    const response = await axios.post(`${API_URL}/add/${userId}`, {
      productId,
      quantity,
      price,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding product to cart:", error);
    throw error;
  }
};
