import { useEffect, useState } from 'react';
import axios from 'axios';

const Billing = () => {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [bills, setBills] = useState([]);
  const [totals, setTotals] = useState({ bottles: 0, amount: 0 });

  const fetchBilling = async (monthValue, yearValue) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/billing?month=${monthValue}&year=${yearValue}`
      );
      setBills(res.data.bills);
      setTotals({
        bottles: res.data.grandTotalBottles,
        amount: res.data.grandTotalAmount,
      });
    } catch (err) {
      console.error('Billing fetch error:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchBilling(month, year);
  };

  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // Month is 0-indexed
    const currentYear = now.getFullYear();
    setMonth(currentMonth);
    setYear(currentYear);
    fetchBilling(currentMonth, currentYear);
  }, []);

  return (
    <div className="container py-5" style={{ background: 'linear-gradient(to right, #e0f7fa, #ffffff)' }}>
      <div className="text-center mb-5">
        <h2 className="fw-bold text-primary">💧 Monthly Water Delivery Billing 💧</h2>
        <p className="text-muted">Track customer deliveries and billing for the current month.</p>
      </div>

      <form onSubmit={handleSubmit} className="row g-4 mb-5 justify-content-center">
        <div className="col-md-4">
          <input
            type="number"
            placeholder="Month (1-12)"
            className="form-control border-primary"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          />
        </div>
        <div className="col-md-4">
          <input
            type="number"
            placeholder="Year (e.g., 2025)"
            className="form-control border-primary"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
        </div>
        <div className="col-md-2 d-grid">
          <button className="btn btn-primary shadow" type="submit">
            Generate Bills
          </button>
        </div>
      </form>

      <div className="row">
        {bills
          .filter((b) => b.amount > 0)  // ✅ Only show customers with bill > 0
          .map((b, idx) => (
            <div key={idx} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title text-info">{b.customer.name}</h5>
                  <p className="card-text mb-2">
                    <strong>Bottles:</strong> {b.totalBottles}
                  </p>
                  <p className="card-text mb-3">
                    <strong>Amount:</strong> ₹{b.amount}
                  </p>
                  <div className="d-flex gap-2">
                    <a
                      href={b.whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-success btn-sm w-100"
                    >
                      WhatsApp Bill
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Monthly Summary */}
      {bills.length > 0 && (
        <div className="alert alert-info mt-5 text-center">
          <h5 className="mb-3">💧 Monthly Summary 💧</h5>
          <p className="mb-1">
            <strong>Total Bottles:</strong> {totals.bottles}
          </p>
          <p>
            <strong>Total Amount:</strong> ₹{totals.amount}
          </p>
        </div>
      )}
    </div>
  );
};

export default Billing;
