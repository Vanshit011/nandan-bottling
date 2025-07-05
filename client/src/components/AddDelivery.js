import { useState, useEffect } from 'react';
import axios from 'axios';

const AddDelivery = () => {
  const [customers, setCustomers] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ customerId: '', date: today, bottles: '' });

  useEffect(() => {
    axios.get('https://api-nandan-node.onrender.com/api/customers').then((res) => setCustomers(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://api-nandan-node.onrender.com/api/deliveries', form);
      alert('✅ Delivery Added Successfully!');
      setForm({ customerId: '', date: today, bottles: '' });
    } catch (err) {
      alert('❌ Failed to Add Delivery');
    }
  };

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
    </div>
  );
};

export default AddDelivery;
