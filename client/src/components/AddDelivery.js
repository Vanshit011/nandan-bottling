import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const AddDelivery = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const todayDate = new Date().toISOString().split("T")[0];
  const [deliveryDate, setDeliveryDate] = useState(todayDate);
  const [bottlesDelivered, setBottlesDelivered] = useState(1); // ✅ default 1
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("token");
        const companyId = localStorage.getItem("companyId");
        if (!token || !companyId) {
          setToast({ message: "Not authorized. Please login again.", type: "danger" });
          return;
        }
        const res = await axios.get(
          `https://api-nandan-node.onrender.com/api/customers?companyId=${companyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCustomers(res.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setToast({ message: "Failed to fetch customers", type: "danger" });
      }
    };
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("companyId");

    if (!token || !companyId) {
      setToast({ message: "Not authorized. Please login again.", type: "danger" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const payload = {
      customerId: selectedCustomer,
      date: deliveryDate,
      bottles: Number(bottlesDelivered),
      companyId,
    };

    try {
      await axios.post("https://api-nandan-node.onrender.com/api/deliveries", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setToast({ message: "Delivery added successfully!", type: "success" });
      setSelectedCustomer("");
      setDeliveryDate(todayDate);
      setBottlesDelivered(1); // ✅ reset to 1 after submit
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Error saving delivery:", error.response?.data || error.message);
      setToast({ message: "Error saving delivery", type: "danger" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-lg rounded-4 mx-auto" style={{ maxWidth: "480px" }}>
        <div className="card-header bg-primary text-white text-center fw-bold fs-4 rounded-top-4">
          🚚 Add Delivery
        </div>
        <div className="card-body">
          {toast && (
            <div className={`alert alert-${toast.type} alert-dismissible fade show`} role="alert">
              {toast.message}
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setToast(null)}></button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="needs-validation" noValidate>
            <div className="mb-3">
              <label htmlFor="customerSelect" className="form-label fw-semibold">
                Select Customer
              </label>
              <select
                id="customerSelect"
                className="form-select"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                required
              >
                <option value="">-- Select --</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              <div className="invalid-feedback">Please select a customer.</div>
            </div>

            <div className="mb-3">
              <label htmlFor="deliveryDate" className="form-label fw-semibold">
                Delivery Date
              </label>
              <input
                type="date"
                id="deliveryDate"
                className="form-control"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
              />
              <div className="invalid-feedback">Please select a delivery date.</div>
            </div>

            {/* ✅ Bottles Input with + and - and no leading 0 */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Number of Bottles</label>
              <div className="input-group">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setBottlesDelivered((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  className="form-control text-center"
                  value={bottlesDelivered}
                  onChange={(e) => {
                    let val = e.target.value;

                    if (val === "") {
                      setBottlesDelivered(""); // allow manual clear
                      return;
                    }

                    let num = Number(val);

                    if (isNaN(num) || num < 1) {
                      setBottlesDelivered(1);
                      return;
                    }

                    setBottlesDelivered(num); // clean numeric input
                  }}
                  min="1"
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setBottlesDelivered((prev) => prev + 1)}
                >
                  +
                </button>
              </div>
              <div className="invalid-feedback">Please enter a valid number of bottles.</div>
            </div>


            <button type="submit" className="btn btn-primary w-100 shadow-sm">
              Add Delivery
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDelivery;
