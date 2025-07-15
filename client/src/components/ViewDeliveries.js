import { useEffect, useState } from 'react';
import axios from 'axios';

const ViewDeliveries = () => {
  const [customers, setCustomers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterByMonth();
  }, [deliveries, selectedMonth]);

  const fetchData = async () => {
    const [custRes, deliveryRes] = await Promise.all([
      axios.get('https://api-nandan-node.onrender.com/api/customers'),
      axios.get('https://api-nandan-node.onrender.com/api/deliveries'),
    ]);
    setCustomers(custRes.data);
    setDeliveries(deliveryRes.data.reverse());
  };

  const filterByMonth = () => {
    const filtered = deliveries.filter((d) => {
      const date = new Date(d.date);
      const deliveryMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return deliveryMonth === selectedMonth;
    });
    setFilteredDeliveries(filtered);
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
    await axios.put(`https://api-nandan-node.onrender.com/api/deliveries/${id}/status`, {
      status: newStatus
    });
    fetchData();
  };

  const deleteDelivery = async (id) => {
    if (window.confirm("Delete this delivery?")) {
      await axios.delete(`https://api-nandan-node.onrender.com/api/deliveries/${id}`);
      fetchData();
    }
  };

  const saveEdit = async () => {
    await axios.put(`https://api-nandan-node.onrender.com/api/deliveries/${editForm._id}`, editForm);
    setEditForm(null);
    fetchData();
  };

  const sendWhatsApp = (delivery) => {
    const customer = customers.find((c) => c._id === delivery.customerId);
    if (!customer?.phone) {
      alert('Phone number not available for this customer');
      return;
    }

    const deliveryDate = new Date(delivery.date).toLocaleDateString('en-IN');
    const ratePerBottle = 20; // 💧 Set your rate here
    const totalAmount = delivery.bottles * ratePerBottle;

    const message = `
Dear ${customer.name},

🧾 *Payment Reminder - Uma Vanshi Drinking Water*

This is a kind reminder regarding your water delivery on *${deliveryDate}*:

• Number of Bottles: ${delivery.bottles}  
• Rate per Bottle: ₹${ratePerBottle}  
• 🔢 *Total Amount: ₹${totalAmount}*  
• Payment Status: *${delivery.status}*

💳 Kindly clear the pending amount at your earliest convenience.  
If you’ve already paid, please ignore this message.

Thank you for choosing Uma Vanshi Drinking Water.  
For queries or support, feel free to reach out.

🙏 Regards,  
*Uma Vanshi Drinking Water*
`;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/91${customer.phone}?text=${encodedMsg}`, '_blank');
  };


  return (
    <div className="container py-4">
      <h3 className="mb-4">📋 Deliveries</h3>

      {/* Month Filter */}
      <div className="mb-3">
        <label>Select Month:</label>
        <input
          type="month"
          className="form-control"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      {/* Delivery Table */}
      <table className="table table-bordered table-striped">
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
          {filteredDeliveries.map((d) => (
            <tr key={d._id}>
              <td>{customers.find((c) => c._id === d.customerId)?.name || 'Unknown'}</td>
              <td>{new Date(d.date).toLocaleDateString()}</td>
              <td>{d.bottles}</td>
              <td>
                <button
                  className={`btn btn-sm ${d.status === 'Paid' ? 'btn-success' : 'btn-warning'}`}
                  onClick={() => toggleStatus(d._id, d.status)}
                >
                  {d.status}
                </button>
              </td>
              <td>
                <button className="btn btn-sm btn-primary me-2" onClick={() => setEditForm(d)}>Edit</button>
                <button className="btn btn-sm btn-danger me-2" onClick={() => deleteDelivery(d._id)}>Delete</button>
                <button className="btn btn-sm btn-success" onClick={() => sendWhatsApp(d)}>📲 WhatsApp</button>
              </td>
            </tr>
          ))}
          {filteredDeliveries.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-muted">No deliveries for selected month.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editForm && (
        <div className="modal show d-block" style={{ background: '#00000088' }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Edit Delivery</h5>
              <select className="form-select mb-2"
                value={editForm.customerId}
                onChange={(e) => setEditForm({ ...editForm, customerId: e.target.value })}>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <input type="date" className="form-control mb-2"
                value={editForm.date?.split('T')[0]}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
              <input type="number" className="form-control mb-2"
                value={editForm.bottles}
                onChange={(e) => setEditForm({ ...editForm, bottles: e.target.value })} />
              <select className="form-select mb-2"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option>Unpaid</option>
                <option>Paid</option>
              </select>
              <div className="d-flex justify-content-end">
                <button className="btn btn-secondary me-2" onClick={() => setEditForm(null)}>Cancel</button>
                <button className="btn btn-success" onClick={saveEdit}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDeliveries;
