// ViewDeliveries.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ViewDeliveries = () => {
  const [customers, setCustomers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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

  const toggleStatus = async (id, currentStatus) => {
    await axios.put(`https://api-nandan-node.onrender.com/api/deliveries/${id}/status`, {
      status: currentStatus === 'Paid' ? 'Unpaid' : 'Paid',
    });
    fetchData();
  };

  const deleteDelivery = async (id) => {
    if (window.confirm('Are you sure to delete this delivery?')) {
      await axios.delete(`https://api-nandan-node.onrender.com/api/deliveries/${id}`);
      fetchData();
    }
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
    <div className="container py-5">
      <h4 className="text-center mb-4">📦 All Deliveries</h4>
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
                <td>{customers.find((c) => c._id === d.customerId)?.name || 'Unknown'}</td>
                <td>{new Date(d.date).toLocaleDateString()}</td>
                <td>{d.bottles}</td>
                <td>
                  <span
                    className={`badge bg-${d.status === 'Paid' ? 'success' : 'warning'} text-white`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleStatus(d._id, d.status)}
                  >
                    {d.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-primary me-2" onClick={() => setEditForm(d)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteDelivery(d._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Delivery</h5>
                <button className="btn-close" onClick={() => setEditForm(null)}></button>
              </div>
              <div className="modal-body">
                <label>Customer</label>
                <select
                  className="form-select"
                  value={editForm.customerId}
                  onChange={(e) => setEditForm({ ...editForm, customerId: e.target.value })}
                >
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <label className="mt-2">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={editForm.date.split('T')[0]}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                />
                <label className="mt-2">Bottles</label>
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

export default ViewDeliveries;
