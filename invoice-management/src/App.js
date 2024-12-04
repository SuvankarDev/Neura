import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import InvoiceForm from "./components/InvoiceForm";
import InvoiceList from "./components/InvoiceList";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<InvoiceForm />} />
        <Route path="/edit/:id" element={<InvoiceForm />} />
        <Route path="/view" element={<InvoiceList />} />
      </Routes>
    </Router>
  );
};

export default App;
