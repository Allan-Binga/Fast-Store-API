import axios from "axios";

const API_URL = "http://localhost:5500/api/auth";

//REGISTER A NEW USER
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data.message;
  }
};

//LOGIN REGISTERED USER
export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data.message;
  }
};

//LOGOUT USER
export const logoutUser = async () => {
  try {
    const response = await axios.post(`${API_URL}/logout`)
    return response.data
  } catch (error) {
    throw error.response.data.mesage;
  }
}