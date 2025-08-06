import { useEffect, useState } from "react";
import axios from "axios";

const ViewDeliveries = () => {
  const [customers, setCustomers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterByMonth();
  }, [deliveries, selectedMonth]);

  const fetchData = async () => {
    const [custRes, deliveryRes] = await Promise.all([
      axios.get("https://api-nandan-node.onrender.com/api/customers"),
      axios.get("https://api-nandan-node.onrender.com/api/deliveries"),
    ]);
    setCustomers(custRes.data);
    setDeliveries(deliveryRes.data.reverse());
  };

  const filterByMonth = () => {
    const filtered = deliveries.filter((d) => {
      const date = new Date(d.date);
      const deliveryMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return deliveryMonth === selectedMonth;
    });
    setFilteredDeliveries(filtered);
  };

  const getSummary = () => {
    let totalBottles = 0;
    let totalAmount = 0;

    filteredDeliveries.forEach((d) => {
      const customer = customers.find((c) => c._id === d.customerId);
      const rate = customer?.ratePerBottle || 0;
      const amount = d.bottles * rate;

      totalBottles += d.bottles;
      totalAmount += amount;
    });

    return {
      totalDeliveries: filteredDeliveries.length,
      totalBottles,
      totalAmount,
    };
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";
    await axios.put(`https://api-nandan-node.onrender.com/api/deliveries/${id}/status`, {
      status: newStatus,
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

  const summary = getSummary();

  return (
    <div className="container py-5">
      <h2 className="text-primary fw-bold mb-4 d-flex align-items-center gap-2">
        📋 View Deliveries
      </h2>

      {/* Summary */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="bg-light p-3 rounded shadow-sm text-center">
            <h6 className="text-muted mb-1">Total Deliveries</h6>
            <h4>{summary.totalDeliveries}</h4>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-light p-3 rounded shadow-sm text-center">
            <h6 className="text-muted mb-1">Total Bottles</h6>
            <h4>{summary.totalBottles}</h4>
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div className="mb-3">
        <label htmlFor="monthSelect" className="form-label fw-semibold">Select Month</label>
        <input
          id="monthSelect"
          type="month"
          className="form-control w-auto"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      {/* Delivery Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-primary">
            <tr>
              <th>Customer</th>
              <th>Date</th>
              <th>Bottles</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">No deliveries for this month.</td>
              </tr>
            )}
            {filteredDeliveries.map((d) => (
              <tr key={d._id}>
                <td>{customers.find((c) => c._id === d.customerId)?.name || "Unknown"}</td>
                <td>{new Date(d.date).toLocaleDateString()}</td>
                <td>{d.bottles}</td>
                <td className="text-center">
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setEditForm(d)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteDelivery(d._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editForm && (
        <div className="modal show fade d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4">
              <h5 className="modal-title mb-3">Edit Delivery</h5>

              <div className="mb-3">
                <label className="form-label">Customer</label>
                <select
                  className="form-select"
                  value={editForm.customerId}
                  onChange={(e) => setEditForm({ ...editForm, customerId: e.target.value })}
                >
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={editForm.date?.split("T")[0]}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Bottles</label>
                <input
                  type="number"
                  className="form-control"
                  value={editForm.bottles}
                  onChange={(e) => setEditForm({ ...editForm, bottles: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={() => setEditForm(null)}>Cancel</button>
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
