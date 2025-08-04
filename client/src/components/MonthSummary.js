import React, { useEffect, useState } from "react";
import axios from "axios";

const MonthSummary = () => {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const fetchSummary = async (month, year) => {
        setLoading(true);
        try {
            const res = await axios.get(
                `https://api-nandan-node.onrender.com/api/deliveries/month-on-month-summary?month=${month}&year=${year}`
            );
            setSummary(res.data);
        } catch (err) {
            console.error("Failed to fetch summary:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary(selectedMonth, selectedYear);
    }, [selectedMonth, selectedYear]);

    const handleMonthChange = (e) => setSelectedMonth(parseInt(e.target.value));
    const handleYearChange = (e) => setSelectedYear(parseInt(e.target.value));

    const sendWhatsApp = (delivery) => {
        const {
            customerName,
            phone,
            totalBottles,
            totalAmount,
            totalDeliveries,
            month
        } = delivery;

        if (!phone) {
            alert('Phone number not available for this customer');
            return;
        }

        const message = `
Dear ${customerName},

🧾 *Uma Vanshi Drinking Water - Monthly Summary*

Here is your delivery summary for *${month}*:

• Deliveries: ${totalDeliveries}
• Bottles: ${totalBottles}
• 💰 *Total Amount: ₹${totalAmount}*

Please make the payment at your earliest convenience.  
If already paid, kindly ignore this message.

🙏 Thank you,  
*Uma Vanshi Drinking Water*
        `;

        const encodedMsg = encodeURIComponent(message);
        window.open(`https://wa.me/91${phone}?text=${encodedMsg}`, '_blank');
    };

    const monthOptions = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
                📊 Month-on-Month Delivery Summary
            </h2>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-semibold mb-1">Month:</label>
                    <select
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {monthOptions.map((name, idx) => (
                            <option key={idx + 1} value={idx + 1}>{name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">Year:</label>
                    <select
                        value={selectedYear}
                        onChange={handleYearChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {[2024, 2025, 2026, 2027].map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <p className="text-center text-gray-600">Loading summary...</p>
            ) : (
                <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
                    <table className="min-w-full table-auto text-sm text-gray-800">
                        <thead className="bg-blue-100 text-blue-800">
                            <tr>
                                <th className="px-4 py-2 border">Customer</th>
                                <th className="px-4 py-2 border">Phone</th>
                                <th className="px-4 py-2 border">Month</th>
                                <th className="px-4 py-2 border">Deliveries</th>
                                <th className="px-4 py-2 border">Bottles</th>
                                <th className="px-4 py-2 border">Amount (₹)</th>
                                <th className="px-4 py-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.map((item, index) => (
                                <tr key={index} className="text-center hover:bg-gray-50 transition">
                                    <td className="px-4 py-2 border">{item.customerName}</td>
                                    <td className="px-4 py-2 border">{item.phone}</td>
                                    <td className="px-4 py-2 border">{item.month}</td>
                                    <td className="px-4 py-2 border">{item.totalDeliveries}</td>
                                    <td className="px-4 py-2 border">{item.totalBottles}</td>
                                    <td className="px-4 py-2 border font-semibold text-green-600">₹{item.totalAmount}</td>
                                    <td className="px-4 py-2 border">
                                        <button
                                            className="bg-green hover:bg-green-600 text-black text-xs px-3 py-1 rounded shadow-sm transition"
                                            onClick={() => sendWhatsApp(item)}
                                        >
                                            📲 WhatsApp
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MonthSummary;
