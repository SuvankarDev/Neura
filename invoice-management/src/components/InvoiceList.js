import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/InvoiceList.css";  // Ensure correct path for CSS file

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await apiClient.get("/");
      setInvoices(response.data.results || response.data); // Handle direct array or paginated results
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await apiClient.delete(`/${id}/`);
        fetchInvoices(); // Refresh the list
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="invoice-list">
      <h1>Invoices</h1>
      <button className="create-invoice-btn" onClick={() => navigate("/create")}>Create Invoice</button>
      <ul>
        {invoices.map((invoice) => (
          <li key={invoice.id} className="invoice-item">
            <h3>{invoice.invoice_number}</h3>
            <p>Customer: {invoice.customer_name}</p>
            <div className="buttons">
              <button className="edit-btn" onClick={() => handleEdit(invoice.id)}>Edit</button>
              <button className="delete-btn" onClick={() => deleteInvoice(invoice.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InvoiceList;
