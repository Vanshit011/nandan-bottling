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
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedPhone = normalizePhone(form.phone);

    if (!validatePhone(form.phone)) {
      triggerToast('❌ Phone number must be 10 digits', 'danger');
      return;
    }

    try {
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
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-header bg-primary text-white text-center fs-4 fw-bold rounded-top-4">
              🚰 Add New Customer
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Customer Name</label>
                  <input
                    className="form-control border-primary shadow-sm"
                    placeholder="Enter customer name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100 mt-3 shadow-sm"
                    onClick={handlePickContact}
                    title="Pick contact from your device"
                  >
                    📇 Select From Mobile Contacts
                  </button>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Phone Number</label>
                  <input
                    className="form-control border-primary shadow-sm"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    autoComplete="tel"
                    inputMode="numeric"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Rate per Bottle (₹)</label>
                  <input
                    type="number"
                    className="form-control border-primary shadow-sm"
                    placeholder="Enter rate"
                    value={form.rate}
                    onChange={(e) => setForm({ ...form, rate: e.target.value })}
                    required
                    min="1"
                    step="0.01"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 shadow fw-semibold fs-5"
                >
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
          className={`toast show position-fixed bottom-0 end-0 m-3 text-white bg-${toastType} border-0 shadow-lg`}
          role="alert"
          style={{ zIndex: 9999, minWidth: '250px' }}
        >
          <div className="toast-header bg-transparent border-0">
            <strong className="me-auto fs-6">
              {toastType === 'success' ? '✅ Success' : '⚠️ Error'}
            </strong>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={() => setShowToast(false)}
            ></button>
          </div>
          <div className="toast-body fw-semibold fs-6">{toastMessage}</div>
        </div>
      )}
    </div>
  );
};

export default AddCustomer;
