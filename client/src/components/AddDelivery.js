import { useState, useEffect } from 'react';
import axios from 'axios';

const AddDelivery = () => {
    const today = new Date().toISOString().split('T')[0];
    const [customers, setCustomers] = useState([]);
    const [form, setForm] = useState({
        customerId: '',
        date: today,
        bottles: '',
        status: 'Unpaid' // ✅ Default status
    });
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        axios.get('https://api-nandan-node.onrender.com/api/customers')
            .then(res => setCustomers(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://api-nandan-node.onrender.com/api/deliveries', form);
            setShowToast(true);  // ✅ Show Toast
            setTimeout(() => setShowToast(false), 2000); // Auto-hide after 2 seconds
            setForm({ customerId: '', date: today, bottles: '', status: 'Unpaid' });
        } catch {
            console.error('Error Adding Customer:');
            alert('❌ Failed to Add Customer');
        }
    };

    return (
        <div className="container py-4">
            <h3 className="mb-4">➕ Add Delivery</h3>
            <form onSubmit={handleSubmit}>
                <select className="form-select mb-2" required
                    value={form.customerId}
                    onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                    <option value="">-- Select Customer --</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>

                <input className="form-control mb-2" type="date" required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })} />

                <input className="form-control mb-2" type="number" required placeholder="No. of bottles"
                    value={form.bottles}
                    onChange={(e) => setForm({ ...form, bottles: e.target.value })} />

                {/* ✅ Status selector */}
                {/* <select className="form-select mb-3" required
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                </select> */}

                <button className="btn btn-primary w-100">Add Delivery</button>
            </form>

            {showToast && (
                <div
                    className="toast show position-fixed bottom-0 end-0 m-3"
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                    style={{ zIndex: 9999 }}
                >
                    <div className="toast-header bg-success text-white">
                        <strong className="me-auto">Success ✅</strong>
                    </div>
                    <div className="toast-body">
                        Delivery Added Successfully!
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddDelivery;
