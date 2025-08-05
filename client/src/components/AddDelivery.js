import React, { useEffect, useState } from "react";
import axios from "axios";

const AddDelivery = () => {
    const today = new Date().toISOString().split("T")[0];

    const [form, setForm] = useState({
        customerId: "",
        date: today,
        bottles: "",
        amount: "",
        status: "unpaid",
    });

    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/customers")
            .then((res) => setCustomers(res.data))
            .catch((err) => console.error("Failed to load customers", err));
    }, []);

    useEffect(() => {
        const selectedCustomer = customers.find((c) => c._id === form.customerId);
        if (selectedCustomer && form.bottles) {
            const rate = selectedCustomer.rate || 0;
            const amount = parseInt(form.bottles) * rate;
            setForm((prev) => ({ ...prev, amount }));
        }
    }, [form.bottles, form.customerId, customers]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/deliveries", form);
            alert("Delivery added successfully!");
            setForm({
                customerId: "",
                date: today,
                bottles: "",
                amount: "",
                status: "unpaid",
            });
        } catch (error) {
            console.error("Error adding delivery:", error);
            alert("Failed to add delivery.");
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-12 px-6 py-8 bg-white shadow-2xl rounded-2xl">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 flex items-center justify-center gap-2">
                🧾 Add Delivery
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Customer */}
                <div>
                    <label className="block mb-2 text-gray-700 font-medium">Customer</label>
                    <select
                        name="customerId"
                        value={form.customerId}
                        onChange={handleChange}
                        required
                        className="w-full max-w-full p-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden truncate"
                    >

                        <option value="">Select Customer</option>
                        {customers.map((c) => (
                            <option key={c._id} value={c._id} className="truncate">{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Date */}
                <div>
                    <label className="block mb-2 text-gray-700 font-medium">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Bottles */}
                <div>
                    <label className="block mb-2 text-gray-700 font-medium">Number of Bottles</label>
                    <input
                        type="number"
                        name="bottles"
                        value={form.bottles}
                        onChange={handleChange}
                        required
                        placeholder="Enter number of bottles"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Amount (auto-calculated) */}
                <div>
                    <label className="block mb-2 text-gray-700 font-medium">Amount</label>
                    <input
                        type="number"
                        name="amount"
                        value={form.amount}
                        readOnly
                        className="w-full p-3 border bg-gray-100 border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                    />
                </div>

                {/* Submit */}
                <button className="btn btn-success w-100 shadow" type="submit">

                    Save Delivery
                </button>
            </form>
        </div>
    );
};

export default AddDelivery;
