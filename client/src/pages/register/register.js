import React, { useState } from "react";
import { registerUser } from "../../api/auth.js";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./register.css";
import Navbar from "../../components/navbar/Navbar.jsx";
import Footer from "../../components/footer/Footer.jsx";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await registerUser(formData);
      toast.success("Registration successful!");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "An error occurred during registration."
      );
    }
  };

  return (
    <div className="layout">
      <Navbar />
      <div className="content">
        <div className="register-container">
          <h2 className="register-heading">Register</h2>
          <form className="register-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="register-input"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="register-input"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="register-input"
              required
            />
            <button type="submit" className="register-button">
              Register
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
