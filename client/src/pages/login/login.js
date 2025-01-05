import React, { useState } from "react";
import { loginUser } from "../../api/auth.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./login.css";
import Navbar from "../../components/navbar/Navbar.jsx";
import Footer from "../../components/footer/Footer.jsx";
import Bar from "../../components/categoriesBar/bar.jsx";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
      toast.success("Login successful!");
      navigate("/products");
    } catch (err) {
      toast.error("Wrong username or password.");
    }
  };

  return (
    <div className="layout">
      <Navbar />
      <Bar />
      <div className="content">
        <div className="login-container">
          <h2 className="login-heading">Login</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="login-input"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="login-input"
              required
            />
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
