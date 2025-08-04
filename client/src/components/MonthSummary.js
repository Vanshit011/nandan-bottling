import React, { useEffect, useState } from "react";
import axios from "axios";
// import Customer from "../components/CustomerList";

const MonthSummary = () => {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // default current month
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // default current year
    // const [Customers, setCustomers] = useState([]);

    // useEffect(() => {
    //     const fetchCustomers = async () => {
    //         try {
    //             const res = await axios.get("http://localhost:5000/api/customers");
    //             setCustomers(res.data);
    //         } catch (err) {
    //             console.error("Error fetching customers", err);
    //         }
    //     };

    //     fetchCustomers();
    // }, []);

    const fetchSummary = async (month, year) => {
        setLoading(true);
        try {
            const res = await axios.get(
                `http://localhost:5000/api/deliveries/month-on-month-summary?month=${month}&year=${year}`
            );
            console.log("Filtered Month Summary Data:", res.data);
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

    const handleMonthChange = (e) => {
        setSelectedMonth(parseInt(e.target.value));
    };

    const handleYearChange = (e) => {
        setSelectedYear(parseInt(e.target.value));
    };

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
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">📊 Month-on-Month Delivery Summary</h2>

            {/* Month and Year Filter */}
            <div className="flex gap-4 items-center mb-6">
                <div>
                    <label className="mr-2 font-medium">Month:</label>
                    <select value={selectedMonth} onChange={handleMonthChange} className="border rounded px-2 py-1">
                        {monthOptions.map((name, idx) => (
                            <option key={idx + 1} value={idx + 1}>{name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="mr-2 font-medium">Year:</label>
                    <select value={selectedYear} onChange={handleYearChange} className="border rounded px-2 py-1">
                        {[2024, 2025, 2026, 2027].map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Data Table */}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border">Customer Name</th>
                                <th className="px-4 py-2 border">Phone</th>
                                <th className="px-4 py-2 border">Month</th>
                                <th className="px-4 py-2 border">Deliveries</th>
                                <th className="px-4 py-2 border">Bottles</th>
                                <th className="px-4 py-2 border">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.map((item, index) => (
                                <tr key={index} className="text-center border-t">
                                    <td className="px-4 py-2 border">{item.customerName}</td>
                                    <td className="px-4 py-2 border">{item.phone}</td>
                                    <td className="px-4 py-2 border">{item.month}</td>
                                    <td className="px-4 py-2 border">{item.totalDeliveries}</td>
                                    <td className="px-4 py-2 border">{item.totalBottles}</td>
                                    <td className="px-4 py-2 border">₹{item.totalAmount}</td>
                                    <td className="px-4 py-2 border">
                                        <button
                                            className="btn btn-sm btn-success"
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
