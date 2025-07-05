import { useEffect, useState } from 'react';
import axios from 'axios';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [editCustomer, setEditCustomer] = useState(null); // For editing
  const [form, setForm] = useState({ name: '', phone: '', rate: '' });

  const fetchCustomers = () => {
    axios.get('http://localhost:5000/api/customers')
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error('Fetch Error:', err));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`http://localhost:5000/api/customers/${id}`);
        alert('Customer Deleted');
        fetchCustomers();
      } catch (err) {
        alert('Failed to Delete Customer');
      }
    }
  };

  const openEditModal = (customer) => {
    setEditCustomer(customer);
    setForm({ name: customer.name, phone: customer.phone, rate: customer.rate });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/customers/${editCustomer._id}`, form);
      alert('Customer Updated');
      setEditCustomer(null);
      fetchCustomers();
    } catch (err) {
      alert('Failed to Update Customer');
    }
  };

  return (
    <div>
      <h4 className="mb-4 fw-bold text-primary">Customer List</h4>
      <table className="table table-striped table-bordered">
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
          {customers.map((c, idx) => (
            <tr key={c._id}>
              <td>{idx + 1}</td>
              <td>{c.name}</td>
              <td>{c.phone}</td>
              <td>₹{c.rate}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => openEditModal(c)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Bootstrap Modal for Edit */}
      {editCustomer && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <form onSubmit={handleEditSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Customer</h5>
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
                  <button type="button" className="btn btn-secondary" onClick={() => setEditCustomer(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
