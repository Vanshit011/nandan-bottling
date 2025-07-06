import { useState } from 'react';
import AddCustomer from './AddCustomer';
import CustomerList from './CustomerList';
import AddDelivery from './AddDelivery';
import Billing from './Billing';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Dashboard.css'; // ✅ Custom Animations

const Dashboard = () => {
  const [page, setPage] = useState('customers');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-primary animate-fade-in">
          💧 Uma Vanshi Drinking water Admin Dashboard
        </h2>
        <p className="text-muted animate-slide-up">
          Manage Customers, Deliveries & Monthly Billing Easily.
        </p>
      </div>

      <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
        <button
          className={`btn btn-outline-primary shadow-sm ${page === 'customers' ? 'active-btn' : ''}`}
          onClick={() => setPage('customers')}
        >
          ➕ Add Customer
        </button>
        <button
          className={`btn btn-outline-secondary shadow-sm ${page === 'list' ? 'active-btn' : ''}`}
          onClick={() => setPage('list')}
        >
          👥 View Customers
        </button>
        <button
          className={`btn btn-outline-success shadow-sm ${page === 'delivery' ? 'active-btn' : ''}`}
          onClick={() => setPage('delivery')}
        >
          🚚 Add Delivery
        </button>
        <button
          className={`btn btn-outline-warning shadow-sm ${page === 'billing' ? 'active-btn' : ''}`}
          onClick={() => setPage('billing')}
        >
          💳 Billing
        </button>
        <button className="btn btn-danger shadow-sm" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      <div className="p-3 border rounded bg-light shadow animated-box">
        {page === 'customers' && <AddCustomer />}
        {page === 'list' && <CustomerList />}
        {page === 'delivery' && <AddDelivery />}
        {page === 'billing' && <Billing />}
      </div>
    </div>
  );
};

export default Dashboard;
