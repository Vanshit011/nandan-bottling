import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // import the function and use autoTable(doc, {...})
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterByMonth();
  }, [deliveries, selectedMonth]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("companyId");
    if (!token || !companyId) {
      setToast({ message: "Not authorized. Please login again.", type: "danger" });
      return;
    }

    try {
      const [custRes, deliveryRes] = await Promise.all([
        axios.get(
          `https://api-nandan-node.onrender.com/api/customers?companyId=${companyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `https://api-nandan-node.onrender.com/api/deliveries?companyId=${companyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);
      setCustomers(custRes.data || []);
      setDeliveries((deliveryRes.data || []).reverse());
    } catch (err) {
      console.error("Error fetching data:", err);
      setToast({ message: "Failed to fetch data", type: "danger" });
    }
  };

  const filterByMonth = () => {
    const filtered = deliveries.filter((d) => {
      if (!d?.date) return false;
      const date = new Date(d.date);
      const deliveryMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return deliveryMonth === selectedMonth;
    });
    setFilteredDeliveries(filtered);
  };

  const getDeliveriesForCustomer = (customerId) => {
    return filteredDeliveries.filter((d) => {
      const id = typeof d.customerId === "object" ? d.customerId?._id : d.customerId;
      return id === customerId;
    });
  };

  const customersThisMonth = Array.from(
    new Set(
      filteredDeliveries.map((d) =>
        typeof d.customerId === "object" ? d.customerId?._id : d.customerId
      )
    )
  )
    .map((id) => customers.find((c) => c._id === id))
    .filter(Boolean);

  // -----------------------
  // PDF: use autoTable(doc, options)
  // -----------------------
  const downloadPDF = (customer) => {
    const custDeliveries = getDeliveriesForCustomer(customer._id);
    const totalBottles = custDeliveries.reduce((sum, d) => sum + (d.bottles || 0), 0);

    // Create doc (use pts units by default)
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text("Customer Deliveries Report", 40, 40);

    doc.setFontSize(11);
    doc.text(`Customer: ${customer.name}`, 40, 64);
    doc.text(`Month: ${selectedMonth}`, 40, 82);

    // Prepare rows: you can add a serial number column if you want
    const rows = custDeliveries.map((d, idx) => [
      idx + 1,
      d.date ? new Date(d.date).toLocaleDateString() : "No Date",
      d.bottles ?? 0,
    ]);

    // Use autoTable(doc, options) (not doc.autoTable)
    autoTable(doc, {
      head: [["#", "Date", "Bottles"]],
      body: rows,
      startY: 100,
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [54, 162, 235], textColor: 255 },
      theme: "grid",
    });

    // Get where the table ended
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 100 + rows.length * 20;

    // Totals below table
    doc.setFontSize(11);
    doc.text(`Total Deliveries: ${custDeliveries.length}`, 40, finalY + 20);
    doc.text(`Total Bottles: ${totalBottles}`, 40, finalY + 36);

    // Save
    const safeCustomerName = (customer.name || "customer").replace(/\s+/g, "_");
    doc.save(`${safeCustomerName}_deliveries_${selectedMonth}.pdf`);
  };

  return (
    <div className="container py-5">
      <h2 className="text-primary fw-bold mb-4 d-flex align-items-center gap-2">📋 View Deliveries</h2>

      {/* Toast */}
      {toast && (
        <div
          className={`alert alert-${toast.type} alert-dismissible fade show position-fixed top-0 end-0 m-3`}
          role="alert"
          style={{ zIndex: 1050, cursor: "pointer", minWidth: "250px" }}
          onClick={() => setToast(null)}
        >
          {toast.message}
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setToast(null)}></button>
        </div>
      )}

      {/* Month Selector */}
      <div className="mb-3">
        <label htmlFor="monthSelect" className="form-label fw-semibold">Select Month</label>
        <input id="monthSelect" type="month" className="form-control w-auto" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
      </div>

      {/* Customers Table */}
      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle mb-0 table-striped">
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
                <td colSpan="4" className="text-center text-muted py-4">No deliveries for this month.</td>
              </tr>
            ) : (
              customersThisMonth.map((c) => {
                const custDeliveries = getDeliveriesForCustomer(c._id);
                const totalBottles = custDeliveries.reduce((sum, d) => sum + (d.bottles || 0), 0);
                return (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{custDeliveries.length}</td>
                    <td>{totalBottles}</td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setSelectedCustomer(c)}>View Details</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedCustomer && (
        <div className="modal show fade d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setSelectedCustomer(null)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content p-4">
              <h5 className="modal-title mb-3">Deliveries - {selectedCustomer.name}</h5>
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Bottles</th>
                  </tr>
                </thead>
                <tbody>
                  {getDeliveriesForCustomer(selectedCustomer._id).map((d) => (
                    <tr key={d._id}>
                      <td>{d.date ? new Date(d.date).toLocaleDateString() : "No Date"}</td>
                      <td>{d.bottles ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="d-flex justify-content-end gap-2">
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
