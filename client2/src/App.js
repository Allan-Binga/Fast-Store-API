import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Homepage from "./pages/homepage/homepage";
import Signup from "./pages/signUp/signup";
import Login from "./pages/logIn/login";

const App = () => {
  return (
    <Router>
      <Toaster position="top-centre" toastOption={{ duration: 2000 }} />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
