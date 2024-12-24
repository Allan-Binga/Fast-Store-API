import axios from "axios";

const API_URL = "http://localhost:5500/api/users";

//GET ALL USERS
export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/`);
    return response.data
  } catch (error) {
    throw error;
  }
};

//GET SINGLE USER
export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error
  }
};

//UPDATE USER
export const updateUser = async (id, updatedUserData) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, updatedUserData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error fetching the product";
  }
};