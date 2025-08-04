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

  const getSummary = () => {
    let totalBottles = 0;
    let totalAmount = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;

    filteredDeliveries.forEach((d) => {
      const customer = customers.find((c) => c._id === d.customerId);
      const rate = customer?.ratePerBottle || 0;
      const amount = d.bottles * rate;

      totalBottles += d.bottles;
      totalAmount += amount;

      if (d.status === 'Paid') {
        paidAmount += amount;
      } else {
        unpaidAmount += amount;
      }
    });

    return {
      totalDeliveries: filteredDeliveries.length,
      totalBottles,
      totalAmount,
      // paidAmount,
      // unpaidAmount
    };
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

  //   const sendWhatsApp = (delivery) => {
  //     const customer = customers.find((c) => c._id === delivery.customerId);
  //     if (!customer?.phone) {
  //       alert('Phone number not available for this customer');
  //       return;
  //     }

  //     const deliveryDate = new Date(delivery.date).toLocaleDateString('en-IN');
  //     const ratePerBottle = 20;
  //     const totalAmount = delivery.bottles * ratePerBottle;

  //     const message = `
  // Dear ${customer.name},

  // 🧾 *Payment Reminder - Uma Vanshi Drinking Water*

  // This is a kind reminder regarding your water delivery on *${deliveryDate}*:

  // • Number of Bottles: ${delivery.bottles}  
  // • Rate per Bottle: ₹${ratePerBottle}  
  // • 🔢 *Total Amount: ₹${totalAmount}*  
  // • Payment Status: *${delivery.status}*

  // 💳 Kindly clear the pending amount at your earliest convenience.  
  // If you’ve already paid, please ignore this message.

  // Thank you for choosing Uma Vanshi Drinking Water.  
  // For queries or support, feel free to reach out.

  // 🙏 Regards,  
  // *Uma Vanshi Drinking Water*
  //     `;

  //     const encodedMsg = encodeURIComponent(message);
  //     window.open(`https://wa.me/91${customer.phone}?text=${encodedMsg}`, '_blank');
  //   };

  const summary = getSummary();

  return (
    <div className="container py-4">
      <h3 className="mb-4">📋 Deliveries</h3>

      {/* 🔷 Summary Box */}
      <div className="alert alert-info d-flex flex-wrap gap-4 justify-content-between">
        <div><strong>Total Deliveries:</strong> {summary.totalDeliveries}</div>
        <div><strong>Total Bottles:</strong> {summary.totalBottles}</div>
        {/* <div><strong>Total Amount:</strong> ₹{summary.totalAmount}</div> */}
      </div>

      {/* Month Filter */}
      <div className="mb-3">
        <label htmlFor="monthSelect" className="form-label">Select Month:</label>
        <input
          id="monthSelect"
          type="month"
          className="form-control"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      {/* Responsive Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-light">
            <tr>
              <th>Customer</th>
              <th>Date</th>
              <th>Bottles</th>
              {/* <th>Amount (₹)</th> */}
              {/* <th>Status</th> */}
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.map((d) => (
              <tr key={d._id}>
                <td>{customers.find((c) => c._id === d.customerId)?.name || 'Unknown'}</td>
                <td>{new Date(d.date).toLocaleDateString()}</td>
                <td>{d.bottles}</td>
                {/* <td>₹{(d.bottles * (customers.find((c) => c._id === d.customerId)?.ratePerBottle || 0))}</td> */}
                {/* <td>
                  <button
                    className={`btn btn-sm ${d.status === 'Paid' ? 'btn-success' : 'btn-warning'}`}
                    onClick={() => toggleStatus(d._id, d.status)}
                  >
                    {d.status}
                  </button>
                </td> */}
                <td className="text-center">
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <button className="btn btn-sm btn-primary" onClick={() => setEditForm(d)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteDelivery(d._id)}>Delete</button>
                    {/* <button className="btn btn-sm btn-success" onClick={() => sendWhatsApp(d)}>📲 WhatsApp</button> */}
                  </div>
                </td>
              </tr>
            ))}
            {filteredDeliveries.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted">No deliveries for selected month.</td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Edit Modal */}
      {editForm && (
        <div className="modal show d-block" style={{ background: '#00000088' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="modal-content p-3">
              <h5 className="mb-3">Edit Delivery</h5>

              {/* Customer Dropdown */}
              <select
                className="form-select mb-3"
                value={editForm.customerId}
                onChange={(e) => setEditForm({ ...editForm, customerId: e.target.value })}
              >
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              {/* Date Input */}
              <input
                type="date"
                className="form-control mb-3"
                value={editForm.date?.split('T')[0]}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              />

              {/* Bottles Input */}
              <input
                type="number"
                className="form-control mb-3"
                value={editForm.bottles}
                onChange={(e) => setEditForm({ ...editForm, bottles: e.target.value })}
              />

              {/* Status Dropdown */}
              <select
                className="form-select mb-3"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end mt-3">
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
