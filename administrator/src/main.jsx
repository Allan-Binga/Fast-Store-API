import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import AdminProvider from "./store/AdminProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AdminProvider>
        <App />
      </AdminProvider>
    </BrowserRouter>
  </StrictMode>,
);
