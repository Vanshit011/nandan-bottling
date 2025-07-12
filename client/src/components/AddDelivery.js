import { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddDelivery = () => {
  const [customers, setCustomers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ customerId: '', date: today, bottles: '', status: 'Unpaid' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchCustomers();
    fetchDeliveries();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('https://api-nandan-node.onrender.com/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Customer Fetch Error:', err);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get('https://api-nandan-node.onrender.com/api/deliveries');
      setDeliveries(res.data);
    } catch (err) {
      console.error('Delivery Fetch Error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://api-nandan-node.onrender.com/api/deliveries', form);
      setToast({ show: true, message: '✅ Delivery Added Successfully!', type: 'success' });
      setForm({ customerId: '', date: today, bottles: '', status: 'Unpaid' });
      fetchDeliveries();
    } catch (err) {
      setToast({ show: true, message: '❌ Failed to Add Delivery', type: 'danger' });
    }
  };

  const deleteDelivery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery?')) return;
    try {
      await axios.delete(`https://api-nandan-node.onrender.com/api/deliveries/${id}`);
      fetchDeliveries();
    } catch (err) {
      alert('Failed to delete delivery');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
      await axios.put(`https://api-nandan-node.onrender.com/api/deliveries/${id}`, { status: newStatus });
      fetchDeliveries();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: '' }), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="container py-5" style={{ background: 'linear-gradient(to right, #e0f2f1, #ffffff)' }}>
      <div className="mx-auto" style={{ maxWidth: '600px' }}>
        <div className="border rounded shadow p-4 bg-white">
          <h3 className="text-center text-primary mb-4">💧 Add Water Delivery 💧</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Select Customer</label>
              <select
                className="form-select border-primary"
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                required
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Delivery Date</label>
              <input
                className="form-control border-primary"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Number of Bottles</label>
              <input
                className="form-control border-primary"
                type="number"
                placeholder="Bottles Delivered"
                value={form.bottles}
                onChange={(e) => setForm({ ...form, bottles: e.target.value })}
                required
              />
            </div>
            <button className="btn btn-success w-100 shadow" type="submit">
              Add Delivery
            </button>
          </form>
        </div>
      </div>

      <hr className="my-4" />

      <div className="table-responsive bg-white p-4 rounded shadow">
        <h5 className="mb-3 fw-bold">📋 All Deliveries</h5>
        <table className="table table-bordered table-hover">
          <thead className="table-primary">
            <tr>
              <th>Customer</th>
              <th>Date</th>
              <th>Bottles</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d._id}>
                <td>{d.name}</td>
                <td>{new Date(d.date).toLocaleDateString()}</td>
                <td>{d.bottles}</td>
                <td>
                  <span
                    className={`badge bg-${d.status === 'Paid' ? 'success' : 'warning'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleStatus(d._id, d.status)}
                  >
                    {d.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteDelivery(d._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast.show && (
        <div
          className={`toast show position-fixed bottom-0 end-0 m-3 border-0 text-white bg-${toast.type}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ zIndex: 9999 }}
        >
          <div className="toast-header bg-success text-white">
            <strong className="me-auto">Notification</strong>
          </div>
          <div className="toast-body">
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDelivery;
