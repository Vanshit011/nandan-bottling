import { useState } from 'react';
import axios from 'axios';


const AddCustomer = () => {
  const [form, setForm] = useState({ name: '', phone: '', rate: '' });
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://api-nandan-node.onrender.com/api/customers', form);
      setForm({ name: '', phone: '', rate: '' });
      setShowToast(true);  // ✅ Show Toast
      setTimeout(() => setShowToast(false), 2000); // Auto-hide after 2 seconds
    } catch (err) {
      console.error('Error Adding Customer:', err);
      alert('❌ Failed to Add Customer');
    }
  };

  return (
    <div className="container py-5" style={{ background: 'linear-gradient(to right, #e0f7fa, #ffffff)' }}>
      <div className="mx-auto" style={{ maxWidth: '600px' }}>
        <div className="border rounded shadow p-4 bg-white">
          <h3 className="text-center text-primary mb-4">🚰 Add New Customer</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Customer Name</label>
              <input
                className="form-control border-primary"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Phone Number</label>
              <input
                className="form-control border-primary"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Rate per Bottle (₹)</label>
              <input
                className="form-control border-primary"
                type="number"
                placeholder="Rate per Bottle"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                required
              />
            </div>
            <button className="btn btn-success w-100 shadow" type="submit">
              Add Customer
            </button>
          </form>
          {showToast && (
            <div
              className="toast show position-fixed bottom-0 end-0 m-3"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              style={{ zIndex: 9999 }}
            >
              <div className="toast-header bg-success text-white">
                <strong className="me-auto">Success ✅</strong>
              </div>
              <div className="toast-body">
                Customer Added Successfully!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;
