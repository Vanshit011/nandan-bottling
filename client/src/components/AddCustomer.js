import { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddCustomer = () => {
  const [form, setForm] = useState({ name: '', phone: '', rate: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const token = localStorage.getItem('token');

  const normalizePhone = (phone) =>
    phone.replace(/\s/g, '').replace(/^(\+91)/, '').replace(/^0+/, '');

  const validatePhone = (phone) => /^[0-9]{10}$/.test(normalizePhone(phone));

  const triggerToast = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedPhone = normalizePhone(form.phone);

    if (!validatePhone(form.phone)) {
      triggerToast('❌ Phone number must be 10 digits', 'danger');
      return;
    }

    try {
      // Check duplicate
      const res = await axios.get(
        'https://api-nandan-node.onrender.com/api/customers',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const exists = res.data.some(
        (cust) => cust.name.trim().toLowerCase() === form.name.trim().toLowerCase()
      );

      if (exists) {
        triggerToast('❌ Customer name already exists', 'danger');
        return;
      }

      // Add customer
      await axios.post(
        'https://api-nandan-node.onrender.com/api/customers',
        { ...form, phone: normalizedPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setForm({ name: '', phone: '', rate: '' });
      triggerToast('✅ Customer Added Successfully!', 'success');
    } catch (err) {
      console.error('Error Adding Customer:', err);
      triggerToast('❌ Failed to Add Customer', 'danger');
    }
  };

  const handlePickContact = async () => {
    try {
      if (!('contacts' in navigator && 'ContactsManager' in window)) {
        alert("Your browser doesn't support contact picker.");
        return;
      }
      const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: false });
      if (contacts.length > 0) {
        const selected = contacts[0];
        setForm({
          ...form,
          name: selected.name?.[0] || '',
          phone: normalizePhone(selected.tel?.[0] || ''),
        });
      }
    } catch (error) {
      console.error('Error picking contact:', error);
      alert('Failed to pick contact.');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h3 className="text-center text-primary mb-4">🚰 Add New Customer</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Customer Name</label>
                  <input
                    className="form-control border-primary"
                    placeholder="Enter customer name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100 mt-2"
                    onClick={handlePickContact}
                  >
                    📇 Select From Mobile Contacts
                  </button>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Phone Number</label>
                  <input
                    className="form-control border-primary"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Rate per Bottle (₹)</label>
                  <input
                    type="number"
                    className="form-control border-primary"
                    placeholder="Enter rate"
                    value={form.rate}
                    onChange={(e) => setForm({ ...form, rate: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success w-100 shadow">
                  ➕ Add Customer
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div
          className={`toast show position-fixed bottom-0 end-0 m-3 text-white bg-${toastType}`}
          role="alert"
          style={{ zIndex: 9999 }}
        >
          <div className="toast-header bg-transparent border-0">
            <strong className="me-auto">
              {toastType === 'success' ? '✅ Success' : '⚠️ Error'}
            </strong>
          </div>
          <div className="toast-body fw-semibold">{toastMessage}</div>
        </div>
      )}
    </div>
  );
};

export default AddCustomer;
