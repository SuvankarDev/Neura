import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Invoice Management App</h1>
      <div className="button-group">
        <button onClick={() => navigate("/create")}>Create Invoice</button>
        <button onClick={() => navigate("/view")}>View Invoices</button>
      </div>
    </div>
  );
};

export default HomePage;
