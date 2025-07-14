import { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddDelivery = () => {
  const today = new Date().toISOString().split('T')[0];
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customerId: '',
    date: today,
    bottles: '',
    status: 'Unpaid', // default status
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('https://api-nandan-node.onrender.com/api/customers');
        setCustomers(res.data);
      } catch (err) {
        console.error('Customer Fetch Error:', err);
      }
    };
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://api-nandan-node.onrender.com/api/deliveries', form);
      setToast({ show: true, message: '✅ Delivery Added!', type: 'success' });
      setForm({
        customerId: '',
        date: today,
        bottles: '',
        status: 'Unpaid', // reset to default
      });
    } catch {
      setToast({ show: true, message: '❌ Failed to Add', type: 'danger' });
    }
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: '' }), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="container py-5 bg-light">
      <div className="mx-auto" style={{ maxWidth: '600px' }}>
        <div className="border rounded shadow p-4 bg-white">
          <h3 className="text-center text-primary mb-4">💧 Add Water Delivery 💧</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Customer</label>
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
                type="date"
                className="form-control"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Number of Bottles</label>
              <input
                type="number"
                className="form-control"
                value={form.bottles}
                onChange={(e) => setForm({ ...form, bottles: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <button className="btn btn-success w-100">Add Delivery</button>
          </form>
        </div>
      </div>

      {toast.show && (
        <div
          className={`toast show position-fixed bottom-0 end-0 m-3 text-white bg-${toast.type}`}
          style={{ zIndex: 9999 }}
        >
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
