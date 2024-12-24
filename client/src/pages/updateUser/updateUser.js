import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateUser } from "../../api/users";
import toast from "react-hot-toast";
import "./updateUser.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

const UpdateUser = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser({ ...user, [name]: value });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      await updateUser(id, user);
      toast.success("User updated successfully.");
      navigate("/users");
    } catch (error) {
      toast.error("Error updating product.");
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };
  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        <div className="content">
          <div className="update-user-container">
            <h1 className="update-user-id">Update user</h1>
            <form className="update-user-form" onSubmit={handleUpdateUser}>
              <input
                className="form-input"
                type="text"
                name="username"
                placeholder="Username"
                value={user.username}
                onChange={handleChange}
                required
              />
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="Email"
                value={user.email}
                onChange={handleChange}
                required
              />
              <div className="button-container">
                <button
                  className="cancel-button"
                  type="button"
                  onClick={handleBackClick}
                >
                  Cancel
                </button>
                <button className="update-button" type="submit">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UpdateUser;
