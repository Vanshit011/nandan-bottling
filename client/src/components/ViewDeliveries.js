import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "bootstrap/dist/css/bootstrap.min.css";

const ViewDeliveries = () => {
  const [customers, setCustomers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [toast, setToast] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editDelivery, setEditDelivery] = useState(null);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { filterByMonth(); }, [deliveries, selectedMonth]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("companyId");
    if (!token || !companyId) return setToast({ message: "Not authorized", type: "danger" });

    try {
      const [custRes, deliveryRes] = await Promise.all([
        axios.get(`https://api-nandan-node.onrender.com/api/customers?companyId=${companyId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`https://api-nandan-node.onrender.com/api/deliveries?companyId=${companyId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setCustomers(custRes.data || []);
      setDeliveries((deliveryRes.data || []).reverse());
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to fetch data", type: "danger" });
    }
  };

  const filterByMonth = () => {
    const filtered = deliveries.filter(d => {
      if (!d?.date) return false;
      const date = new Date(d.date);
      const deliveryMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return deliveryMonth === selectedMonth;
    });
    setFilteredDeliveries(filtered);
  };

  const getDeliveriesForCustomer = (customerId) =>
    filteredDeliveries.filter(d => (typeof d.customerId === "object" ? d.customerId?._id : d.customerId) === customerId);

  const formatDate = (dateStr) => {
    if (!dateStr) return "No Date";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const customersThisMonth = Array.from(new Set(filteredDeliveries.map(d => typeof d.customerId === "object" ? d.customerId?._id : d.customerId)))
    .map(id => customers.find(c => c._id === id))
    .filter(Boolean);

  const downloadPDF = (customer) => {
    const custDeliveries = getDeliveriesForCustomer(customer._id);
    const totalBottles = custDeliveries.reduce((sum, d) => sum + (d.bottles || 0), 0);

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Customer Deliveries Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Customer: ${customer.name}`, 14, 30);
    doc.text(`Month: ${selectedMonth}`, 14, 38);

    const rows = custDeliveries.map((d, i) => [i + 1, formatDate(d.date), d.bottles ?? ""]);
    autoTable(doc, { head: [["#", "Date", "Bottles"]], body: rows, startY: 50 });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 50 + rows.length * 20;
    doc.text(`Total Deliveries: ${custDeliveries.length}`, 14, finalY + 15);
    doc.text(`Total Bottles: ${totalBottles}`, 14, finalY + 30);

    doc.save(`${customer.name}_deliveries_${selectedMonth}.pdf`);
  };

  const deleteDelivery = async (deliveryId) => {
    const token = localStorage.getItem("token");
    if (!token) return setToast({ message: "Not authorized", type: "danger" });
    if (!window.confirm("Delete this delivery?")) return;

    try {
      await axios.delete(`https://api-nandan-node.onrender.com/api/deliveries/${deliveryId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      setToast({ message: "Delivery deleted successfully.", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to delete delivery", type: "danger" });
    }
  };

  const saveEditDelivery = async () => {
    const token = localStorage.getItem("token");
    if (!token) return setToast({ message: "Not authorized", type: "danger" });

    try {
      await axios.put(`https://api-nandan-node.onrender.com/api/deliveries/${editDelivery._id}`, {
        customerId: editDelivery.customerId,
        date: editDelivery.date,
        bottles: editDelivery.bottles
      }, { headers: { Authorization: `Bearer ${token}` } });
      setEditDelivery(null);
      fetchData();
      setToast({ message: "Delivery updated successfully", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to update delivery", type: "danger" });
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-primary fw-bold mb-4">📋 View Deliveries</h2>

      {toast && (
        <div className={`alert alert-${toast.type} alert-dismissible fade show position-fixed top-0 end-0 m-3`} role="alert" style={{ zIndex: 1050, cursor: "pointer" }} onClick={() => setToast(null)}>
          {toast.message}
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setToast(null)}></button>
        </div>
      )}

      <div className="mb-3">
        <label className="form-label fw-semibold">Select Month</label>
        <input type="month" className="form-control w-auto" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
      </div>

      {/* ✅ Monthly Totals */}
      <div className="alert alert-info fw-semibold">
        Total Deliveries: {filteredDeliveries.length} |{" "}
        Total Bottles: {filteredDeliveries.reduce((sum, d) => sum + (d.bottles || 0), 0)}
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-primary">
            <tr>
              <th>Customer</th>
              <th>Total Deliveries</th>
              <th>Total Bottles</th>
              <th className="text-center">View</th>
            </tr>
          </thead>
          <tbody>
            {customersThisMonth.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-muted">No deliveries this month</td>
              </tr>
            ) : customersThisMonth.map(c => {
              const custDeliveries = getDeliveriesForCustomer(c._id);
              const totalBottles = custDeliveries.reduce((sum, d) => sum + (d.bottles || 0), 0);
              return (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{custDeliveries.length}</td>
                  <td>{totalBottles}</td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setSelectedCustomer(c)}>View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedCustomer && (
        <div className="modal show fade d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setSelectedCustomer(null)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content p-4">
              <h5 className="modal-title mb-3">Deliveries - {selectedCustomer.name}</h5>
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Bottles</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getDeliveriesForCustomer(selectedCustomer._id).map(d => (
                    <tr key={d._id}>
                      <td>{editDelivery && editDelivery._id === d._id ? <input type="date" className="form-control" value={editDelivery.date?.split("T")[0] || ""} onChange={e => setEditDelivery({ ...editDelivery, date: e.target.value })} /> : formatDate(d.date)}</td>
                      <td>{editDelivery && editDelivery._id === d._id ? <input type="number" className="form-control" value={editDelivery.bottles || ""} onChange={e => setEditDelivery({ ...editDelivery, bottles: Number(e.target.value) })} min="0" /> : (d.bottles ?? "")}</td>
                      <td className="text-center">
                        {editDelivery && editDelivery._id === d._id ? (
                          <>
                            <button className="btn btn-sm btn-success me-2" onClick={saveEditDelivery}>Save</button>
                            <button className="btn btn-sm btn-secondary" onClick={() => setEditDelivery(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setEditDelivery(d)}>Edit</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteDelivery(d._id)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-secondary" onClick={() => setSelectedCustomer(null)}>Close</button>
                <button className="btn btn-success" onClick={() => downloadPDF(selectedCustomer)}>Download PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDeliveries;
