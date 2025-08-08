import React, { useEffect, useState } from 'react';
import axios from 'axios';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Bills = () => {
  const [customers, setCustomers] = useState([]);
  const [billsData, setBillsData] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [error, setError] = useState(null);

  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);

  const [form, setForm] = useState({
    customerId: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: 'unpaid',
    description: '',
  });

  const [editingBillId, setEditingBillId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const getCustomerName = (customerId) => {
    const customer = customers.find(cust => cust._id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://api-nandan-node.onrender.com/api/customers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomers(res.data);
      } catch (err) {
        console.error('Failed to fetch customers', err);
        setError('Failed to load customers');
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  const fetchBills = async () => {
    setLoadingBills(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      let url = `https://api-nandan-node.onrender.com/api/bills/monthwise?year=${filterYear}`;
      if (filterMonth && filterMonth !== 0) {
        url += `&month=${filterMonth}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBillsData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch bills data.');
    } finally {
      setLoadingBills(false);
    }
  };

  useEffect(() => {
    if (!loadingCustomers) fetchBills();
  }, [filterYear, filterMonth, loadingCustomers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'filterYear') setFilterYear(Number(value));
    else if (name === 'filterMonth') setFilterMonth(Number(value));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'month' || name === 'year' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customerId) {
      alert('Please select a customer');
      return;
    }
    if (!form.amount) {
      alert('Please enter an amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://api-nandan-node.onrender.com/api/bills',
        {
          customerId: form.customerId,
          amount: Number(form.amount),
          month: Number(form.month),
          year: Number(form.year),
          status: form.status,
          description: form.description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Bill added successfully');
      setForm((prev) => ({ ...prev, amount: '', description: '', status: 'unpaid' }));
      fetchBills();
    } catch (err) {
      console.error(err);
      alert('Failed to add bill');
    }
  };

  const startEdit = (bill) => {
    setEditingBillId(bill._id);
    setEditForm({
      customerId: bill.customerId,
      amount: bill.amount,
      month: bill.month,
      year: bill.year,
      status: bill.status,
      description: bill.description || '',
    });
  };

  const cancelEdit = () => {
    setEditingBillId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === 'month' || name === 'year' ? Number(value) : value,
    }));
  };

  const submitEdit = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://api-nandan-node.onrender.com/api/bills/${id}`,
        {
          ...editForm,
          amount: Number(editForm.amount),
          month: Number(editForm.month),
          year: Number(editForm.year),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Bill updated successfully');
      setEditingBillId(null);
      fetchBills();
    } catch (err) {
      console.error(err);
      alert('Failed to update bill');
    }
  };

  const deleteBill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://api-nandan-node.onrender.com/api/bills/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Bill deleted successfully');
      fetchBills();
    } catch (err) {
      console.error(err);
      alert('Failed to delete bill');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Manage payments</h2>

      {/* Add bill form */}
      {loadingCustomers ? (
        <p>Loading customers...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mb-5">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <label htmlFor="customerId" className="form-label">
                Customer:
              </label>
              <select
                id="customerId"
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">-- Select Customer --</option>
                {customers.map((cust) => (
                  <option key={cust._id} value={cust._id}>
                    {cust.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label htmlFor="amount" className="form-label">
                Amount:
              </label>
              <input
                id="amount"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="form-control"
                required
                min="0"
                step="0.01"
                placeholder="Enter amount"
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="month" className="form-label">
                Month:
              </label>
              <select
                id="month"
                name="month"
                value={form.month}
                onChange={handleChange}
                className="form-select"
              >
                {monthNames.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="year" className="form-label">
                Year:
              </label>
              <input
                id="year"
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                className="form-control"
                min="2000"
                max="2100"
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="status" className="form-label">
                Status:
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="col-12">
              <label htmlFor="description" className="form-label">
                Description:
              </label>
              <input
                id="description"
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="form-control"
                placeholder="Optional"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-3">
            Add
          </button>
        </form>
      )}

      <hr />

      <h3 className="mb-3">
        Monthly payments Summary
      </h3>

      {/* Filter controls */}
      <div className="row mb-4 g-3 align-items-center">
        <div className="col-md-3">
          <label htmlFor="filterYear" className="form-label">
            Filter Year:
          </label>
          <input
            type="number"
            id="filterYear"
            name="filterYear"
            value={filterYear}
            min="2000"
            max="2100"
            onChange={handleFilterChange}
            className="form-control"
          />
        </div>

        <div className="col-md-3">
          <label htmlFor="filterMonth" className="form-label">
            Filter Month:
          </label>
          <select
            id="filterMonth"
            name="filterMonth"
            value={filterMonth}
            onChange={handleFilterChange}
            className="form-select"
          >
            <option value={0}>All Months</option>
            {monthNames.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingBills ? (
        <p>Loading bills summary...</p>
      ) : billsData.length === 0 ? (
        <p>No bills found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Customer name</th>
                <th>Amount</th>
                <th>Month</th>
                <th>Year</th>
                <th>Status</th>
                <th>Description</th>
                <th style={{ minWidth: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {billsData.map((bill, index) => (
                <tr key={bill._id || index}>
                  <td>{getCustomerName(bill.customerId)}</td>

                  {editingBillId === bill._id ? (
                    <>
                      <td>
                        <input
                          type="number"
                          name="amount"
                          value={editForm.amount}
                          onChange={handleEditChange}
                          min="0"
                          step="0.01"
                          className="form-control"
                        />
                      </td>
                      <td>
                        <select
                          name="month"
                          value={editForm.month}
                          onChange={handleEditChange}
                          className="form-select"
                        >
                          {monthNames.map((m, i) => (
                            <option key={i} value={i + 1}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          name="year"
                          value={editForm.year}
                          onChange={handleEditChange}
                          min="2000"
                          max="2100"
                          className="form-control"
                        />
                      </td>
                      <td>
                        <select
                          name="status"
                          value={editForm.status}
                          onChange={handleEditChange}
                          className="form-select"
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                          className="form-control"
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td>₹{bill.amount}</td>
                      <td>{monthNames[bill.month - 1]}</td>
                      <td>{bill.year}</td>
                      <td>{bill.status}</td>
                      <td>{bill.description}</td>
                    </>
                  )}

                  <td>
                    {editingBillId === bill._id ? (
                      <>
                        <button
                          onClick={() => submitEdit(bill._id)}
                          className="btn btn-sm btn-success me-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="btn btn-sm btn-secondary"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(bill)}
                          className="btn btn-sm btn-primary me-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteBill(bill._id)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Bills;
