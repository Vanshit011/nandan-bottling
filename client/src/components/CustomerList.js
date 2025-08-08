import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [editCustomer, setEditCustomer] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', rate: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const normalizePhone = (phone) =>
    phone.replace(/\s/g, '').replace(/^(\+91)/, '').replace(/^0+/, '');

  const fetchCustomers = () => {
    axios
      .get('https://api-nandan-node.onrender.com/api/customers', config)
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error('Fetch Error:', err));
  };

  useEffect(() => {
    if (!token) {
      alert("Please log in first");
      return;
    }
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`https://api-nandan-node.onrender.com/api/customers/${id}`, config);
        triggerToast('✅ Customer Deleted Successfully!', 'success');
        fetchCustomers();
      } catch (err) {
        triggerToast('❌ Failed to Delete Customer', 'danger');
      }
    }
  };

  const openEditModal = (customer) => {
    setEditCustomer(customer);
    setForm({
      name: customer.name,
      phone: customer.phone,
      rate: customer.rate
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `https://api-nandan-node.onrender.com/api/customers/${editCustomer._id}`,
        { ...form, phone: normalizePhone(form.phone) },
        config
      );
      setEditCustomer(null);
      triggerToast('✅ Customer Updated Successfully!', 'success');
      fetchCustomers();
    } catch (err) {
      triggerToast('❌ Failed to Update Customer', 'danger');
    }
  };

  const triggerToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-primary text-white fw-bold fs-4 text-center rounded-top-4">
          👥 Customer List
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle mb-0">
              <thead className="table-primary text-center">
                <tr>
                  <th style={{ width: '5%' }}>#</th>
                  <th style={{ width: '30%' }}>Name</th>
                  <th style={{ width: '25%' }}>Phone</th>
                  <th style={{ width: '15%' }}>Rate (₹)</th>
                  <th style={{ width: '25%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((c, idx) => (
                    <tr key={c._id}>
                      <td className="text-center">{idx + 1}</td>
                      <td>{c.name}</td>
                      <td>{c.phone}</td>
                      <td className="text-center">₹{c.rate}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-warning me-2 shadow-sm"
                          onClick={() => openEditModal(c)}
                          title="Edit Customer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger shadow-sm"
                          onClick={() => handleDelete(c._id)}
                          title="Delete Customer"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editCustomer && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg">
              <form onSubmit={handleEditSubmit}>
                <div className="modal-header bg-primary text-white rounded-top-4">
                  <h5 className="modal-title">✏️ Edit Customer</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setEditCustomer(null)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Name</label>
                    <input
                      type="text"
                      className="form-control shadow-sm"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      autoComplete="off"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Phone</label>
                    <input
                      type="text"
                      className="form-control shadow-sm"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      autoComplete="tel"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Rate per Bottle (₹)</label>
                    <input
                      type="number"
                      className="form-control shadow-sm"
                      value={form.rate}
                      onChange={(e) => setForm({ ...form, rate: e.target.value })}
                      required
                      min="1"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary shadow-sm"
                    onClick={() => setEditCustomer(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary shadow-sm">
                    💾 Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div
          className={`toast show position-fixed bottom-0 end-0 m-3 text-white bg-${toast.type} border-0 shadow-lg`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ zIndex: 9999, minWidth: '250px' }}
        >
          <div className="toast-header bg-transparent border-0">
            <strong className="me-auto fs-6">
              {toast.type === 'success' ? '✅ Success' : '⚠️ Error'}
            </strong>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
            ></button>
          </div>
          <div className="toast-body fw-semibold fs-6">{toast.message}</div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
