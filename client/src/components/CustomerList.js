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
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
  };

  return (
    <div className="card shadow-sm bg-white">
      <div className="card-body">
        <h4 className="mb-4 fw-bold text-primary">👥 Customer List</h4>

        <div className="table-responsive">
          <table className="table table-hover align-middle table-bordered">
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c, idx) => (
                  <tr key={c._id}>
                    <td>{idx + 1}</td>
                    <td>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>₹{c.rate}</td>
                    <td>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => openEditModal(c)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id)}>
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

      {/* Edit Modal */}
      {editCustomer && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleEditSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">✏️ Edit Customer</h5>
                  <button type="button" className="btn-close" onClick={() => setEditCustomer(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Rate per Bottle (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.rate}
                      onChange={(e) => setForm({ ...form, rate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditCustomer(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">💾 Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div
          className={`toast show position-fixed bottom-0 end-0 m-3 text-white bg-${toast.type}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ zIndex: 9999 }}
        >
          <div className="toast-header bg-transparent border-0">
            <strong className="me-auto">{toast.type === 'success' ? '✅ Success' : '⚠️ Error'}</strong>
          </div>
          <div className="toast-body fw-semibold">{toast.message}</div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
