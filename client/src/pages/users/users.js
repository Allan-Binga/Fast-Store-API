import React, { useEffect, useState } from "react";
import { getUsers } from "../../api/users";
import "./users.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
// import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  // const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        toast.error("Error fetching user.");
      }
    };
    fetchUsers();
  }, []);

  // const handleUserClick = (id) => {
  //   navigate(`/faststore/users/${id}`);
  // };

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        <div className="users-container">
          <h1 className="users-id">Users</h1>
          <div className="users-grid">
            {users.map((user) => (
              <div
                className="user-card"
                key={user._id}
               // onClick={() => handleUserClick(user._id)}
                style={{ cursor: "pointer" }}
              >
                <p className="username">
                  <strong>Username:</strong>
                  {user.username}
                </p>
                <p className="user-email">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="created-at">
                  <strong>Created On:</strong>
                  {user.createdAt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Users;
