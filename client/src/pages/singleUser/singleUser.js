import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { getUserById } from "../../api/users";
import "./singleUser.css"
 

const SingleUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(id);
        setUser(userData);
      } catch (error) {
        toast.error("Error fetching user");
        setUser(null);
      }
    };
    fetchUser();
  }, [id]);

  const handleUpdateUserClick = (id) => {
    navigate(`/faststore/users/update/${id}`);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (user === null) return null;
  if (!user) return <p>User not found.</p>;

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        <div className="single-user-container">
          <button className="back-button" onClick={handleBackClick}>
            &larr; Back
          </button>
          <h1 className="single-user-id">User-ID: {user._id}</h1>
          <div className="single-user-details">
            <div className="single-user-info">
              <p>
                <strong>Username: </strong>
                {user.username}
              </p>
              <p className="user-email">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="created-at">
                <strong>Created On:</strong>
                {user.createdAt}
              </p>
              <div className="user-actions">
              <button
                  className="delete-button"
                >
                  Delete User
                </button>
                <button
                  className="update-button"
                  key={user._id}
                  onClick={() => handleUpdateUserClick(user._id)}
                  style={{ cursor: "pointer" }}
                >
                  Update User
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SingleUser;
