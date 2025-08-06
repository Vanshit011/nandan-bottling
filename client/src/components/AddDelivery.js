import React, { useState, useEffect } from "react";
import axios from "axios";

const AddDelivery = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [bottlesDelivered, setBottlesDelivered] = useState("");
  const [toast, setToast] = useState(null); // for success message

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get("https://api-nandan-node.onrender.com/api/customers");
        setCustomers(res.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };

    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      customerId: selectedCustomer,
      date: deliveryDate,
      bottles: bottlesDelivered,
    };

    console.log("Sending delivery:", payload);

    try {
      const response = await axios.post("https://api-nandan-node.onrender.com/api/deliveries", payload);
    //   console.log("Delivery saved:", response.data);

      // Show toast message
      setToast("Delivery added successfully!");

      // Reset form fields
      setSelectedCustomer("");
      setDeliveryDate("");
      setBottlesDelivered("");

      // Hide toast after 2 seconds
      setTimeout(() => setToast(null), 2000);

    } catch (error) {
      console.error("Error saving delivery:", error.response?.data || error.message);
      setToast("Error saving delivery");
      setTimeout(() => setToast(null), 2000);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto relative">
      <h2 className="text-xl font-bold mb-4">Add Delivery</h2>
      
      {toast && (
        <div className="fixed top-4 right-4 bg-green-500 text-black px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Select Customer:</label>
          <select
            className="w-full p-2 border"
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
        </div>

        <div>
          <label className="block mb-1">Delivery Date:</label>
          <input
            type="date"
            className="w-full p-2 border"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Number of Bottles:</label>
          <input
            type="number"
            className="w-full p-2 border"
            value={bottlesDelivered}
            onChange={(e) => setBottlesDelivered(e.target.value)}
            required
            min={1}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-black px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Delivery
        </button>
      </form>
    </div>
  );
};

export default AddDelivery;
