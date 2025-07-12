import { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddDelivery = () => {
  const [customers, setCustomers] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ customerId: '', date: today, bottles: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deliveries, setDeliveries] = useState([]);
  const [editForm, setEditForm] = useState(null); // For editing

  // Load customers and deliveries
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, deliveryRes] = await Promise.all([
        axios.get('https://api-nandan-node.onrender.com/api/customers'),
        axios.get('https://api-nandan-node.onrender.com/api/deliveries'),
      ]);
      setCustomers(custRes.data);
      setDeliveries(deliveryRes.data);
    } catch (err) {
      console.error('Fetch Error:', err);
    }
  };

  // Add new delivery
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://api-nandan-node.onrender.com/api/deliveries', form);
      setToast({ show: true, message: '✅ Delivery Added!', type: 'success' });
      setForm({ customerId: '', date: today, bottles: '' });
      fetchData();
    } catch {
      setToast({ show: true, message: '❌ Failed to Add', type: 'danger' });
    }
  };

  // Toggle paid/unpaid
  const toggleStatus = async (id, currentStatus) => {
    await axios.put(`https://api-nandan-node.onrender.com/api/deliveries/${id}/status`, {
      status: currentStatus === 'Paid' ? 'Unpaid' : 'Paid',
    });
    fetchData();
  };

  // Delete delivery
  const deleteDelivery = async (id) => {
    if (window.confirm('Are you sure to delete this delivery?')) {
      await axios.delete(`https://api-nandan-node.onrender.com/api/deliveries/${id}`);
      fetchData();
    }
  };

  // Edit delivery
  const openEdit = (delivery) => {
    setEditForm({ ...delivery });
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`https://api-nandan-node.onrender.com/api/deliveries/${editForm._id}`, editForm);
      setEditForm(null);
      setToast({ show: true, message: '✏️ Delivery Updated', type: 'info' });
      fetchData();
    } catch {
      setToast({ show: true, message: '❌ Update Failed', type: 'danger' });
    }
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: '' }), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="container py-5" style={{ background: '#f1f5f9' }}>
      <div className="mx-auto" style={{ maxWidth: '600px' }}>
        <div className="border rounded shadow p-4 bg-white">
          <h3 className="text-center text-primary mb-4">💧 Add Water Delivery 💧</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Select Customer</label>
              <select
                className="form-select"
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
              <label className="form-label">Delivery Date</label>
              <input
                className="form-control"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Number of Bottles</label>
              <input
                className="form-control"
                type="number"
                value={form.bottles}
                onChange={(e) => setForm({ ...form, bottles: e.target.value })}
                required
              />
            </div>
            <button className="btn btn-success w-100">Add Delivery</button>
          </form>
        </div>
      </div>

      {/* 📋 List Deliveries */}
      <div className="mt-5">
        <h4 className="text-center mb-3">📦 All Deliveries</h4>
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Date</th>
                <th>Bottles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d._id}>
                  <td>{customers.find(c => c._id === d.customerId)?.name || 'Unknown'}</td>
                  <td>{new Date(d.date).toLocaleDateString()}</td>
                  <td>{d.bottles}</td>
                  <td>
                    <span
                      className={`badge bg-${d.status === 'Paid' ? 'success' : 'warning'} text-white`}
                      onClick={() => toggleStatus(d._id, d.status)}
                      style={{ cursor: 'pointer' }}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => openEdit(d)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteDelivery(d._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✏️ Edit Modal */}
      {editForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Delivery</h5>
                <button type="button" className="btn-close" onClick={() => setEditForm(null)}></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Customer</label>
                <select
                  className="form-select"
                  value={editForm.customerId}
                  onChange={(e) => setEditForm({ ...editForm, customerId: e.target.value })}
                >
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <label className="form-label mt-2">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={editForm.date.split('T')[0]}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                />
                <label className="form-label mt-2">Bottles</label>
                <input
                  type="number"
                  className="form-control"
                  value={editForm.bottles}
                  onChange={(e) => setEditForm({ ...editForm, bottles: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditForm(null)}>Cancel</button>
                <button className="btn btn-success" onClick={handleEditSave}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Toast */}
      {toast.show && (
        <div className={`toast show position-fixed bottom-0 end-0 m-3 text-white bg-${toast.type}`} style={{ zIndex: 9999 }}>
          <div className="toast-header bg-dark text-white">
            <strong className="me-auto">Alert</strong>
          </div>
          <div className="toast-body">{toast.message}</div>
        </div>
      )}
    </div>
  );
};

export default AddDelivery;
