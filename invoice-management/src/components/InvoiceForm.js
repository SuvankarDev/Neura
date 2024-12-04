import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/InvoiceForm.css";

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    invoice_number: '',
    customer_name: '',
    date: '',
    details: [],
  });

  const [allInvoices, setAllInvoices] = useState([]);

  const fetchInvoice = useCallback(async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/invoices/${id}/`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  }, [id]);

  const fetchAllInvoices = useCallback(async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/invoices/');
      setAllInvoices(response.data);
    } catch (error) {
      console.error('Error fetching all invoices:', error);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
    fetchAllInvoices();
  }, [id, fetchInvoice, fetchAllInvoices]);

  const handleValidation = () => {
    // Validate Customer Name
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(formData.customer_name)) {
      alert("Customer name must contain only alphabetic characters.");
      return false;
    }

    // Validate Invoice Number
    if (!formData.invoice_number.trim()) {
      alert("Invoice number is required.");
      return false;
    } else if (!id && allInvoices.some((inv) => inv.invoice_number === formData.invoice_number)) {
      alert("This invoice number already exists. Please edit the existing invoice.");
      return false;
    }

    // Validate Invoice Details
    for (const [index, detail] of formData.details.entries()) {
      if (!detail.description.trim()) {
        alert(`Description for item ${index + 1} is required.`);
        return false;
      }
      if (isNaN(detail.unit_price) || detail.unit_price < 0) {
        alert(`Unit price for item ${index + 1} must be a number greater than or equal to 0.`);
        return false;
      }
      if (isNaN(detail.quantity) || detail.quantity < 0) {
        alert(`Quantity for item ${index + 1} must be a number greater than or equal to 0.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!handleValidation()) {
      return;
    }

    try {
      if (id) {
        await axios.put(`http://127.0.0.1:8000/api/invoices/${id}/`, formData);
      } else {
        await axios.post('http://127.0.0.1:8000/api/invoices/', formData);
      }
      navigate('/');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDetails = [...formData.details];
    updatedDetails[index][name] = name === 'unit_price' || name === 'quantity' ? parseFloat(value) : value;
    setFormData({ ...formData, details: updatedDetails });
  };

  const addDetail = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { description: '', quantity: 1, unit_price: 0 }],
    });
  };

  const removeDetail = (index) => {
    const updatedDetails = formData.details.filter((_, i) => i !== index);
    setFormData({ ...formData, details: updatedDetails });
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>{id ? 'Edit Invoice' : 'Create Invoice'}</h1>

      <div>
        <label>Invoice Number</label>
        <input
          type="text"
          name="invoice_number"
          value={formData.invoice_number}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Customer Name</label>
        <input
          type="text"
          name="customer_name"
          value={formData.customer_name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <h2>Line Items</h2>
      {formData.details.map((detail, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={detail.description}
            onChange={(e) => handleDetailChange(index, e)}
            required
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={detail.quantity}
            onChange={(e) => handleDetailChange(index, e)}
            required
          />
          <input
            type="number"
            step="0.01"
            name="unit_price"
            placeholder="Unit Price"
            value={detail.unit_price}
            onChange={(e) => handleDetailChange(index, e)}
            required
          />
          <button type="button" onClick={() => removeDetail(index)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addDetail}>
        Add Line Item
      </button>

      <button type="submit">Save</button>

      <button type="button" onClick={handleBack}>
        Back to Home
      </button>
    </form>
  );
};

export default InvoiceForm;
