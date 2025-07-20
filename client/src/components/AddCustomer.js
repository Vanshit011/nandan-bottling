import { useState } from 'react';
import axios from 'axios';

const AddCustomer = () => {
  const [form, setForm] = useState({ name: '', phone: '', rate: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // or 'danger'

  const normalizePhone = (phone) => {
    return phone.replace(/\s/g, '').replace(/^(\+91)/, '');
  };

  const validatePhone = (phone) => {
    const cleaned = normalizePhone(phone);
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhone(form.phone)) {
      setToastType('danger');
      setToastMessage('❌ Phone number must be 10 digits');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }


    try {
      // Check if customer with same name already exists
      const res = await axios.get('https://api-nandan-node.onrender.com/api/customers');
      const exists = res.data.some(cust => cust.name.trim().toLowerCase() === form.name.trim().toLowerCase());

      if (exists) {
        setToastType('danger');
        setToastMessage('❌ Customer name already exists');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
        return;
      }

      // Add new customer
      await axios.post('https://api-nandan-node.onrender.com/api/customers', form);
      setForm({ name: '', phone: '', rate: '' });

      setToastType('success');
      setToastMessage('✅ Customer Added Successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Error Adding Customer:', err);
      setToastType('danger');
      setToastMessage('❌ Failed to Add Customer');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handlePickContact = async () => {
    try {
      if (!('contacts' in navigator && 'ContactsManager' in window)) {
        alert("Your browser doesn't support contact picker.");
        return;
      }

      const props = ['name', 'tel'];
      const opts = { multiple: false };

      const contacts = await navigator.contacts.select(props, opts);

      if (contacts.length > 0) {
        const selected = contacts[0];
        setForm({
          ...form,
          name: selected.name?.[0] || '',
          phone: selected.tel?.[0] || '',
        });
      }
    } catch (error) {
      console.error('Error picking contact:', error);
      alert('Failed to pick contact.');
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
              <button
                type="button"
                className="btn btn-outline-secondary w-100 mb-3"
                onClick={handlePickContact}
              >
                📇 Select From Mobile Contacts
              </button>
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
              className={`toast show position-fixed bottom-0 end-0 m-3 border-0 text-white bg-${toastType}`}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              style={{ zIndex: 9999 }}
            >
              <div className="toast-header bg-transparent border-0">
                <strong className="me-auto">{toastType === 'success' ? '✅ Success' : '⚠️ Error'}</strong>
              </div>
              <div className="toast-body">{toastMessage}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;
