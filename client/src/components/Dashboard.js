import { useState } from 'react';
import AddCustomer from './AddCustomer';
import CustomerList from './CustomerList';
import AddDelivery from './AddDelivery';
import Billing from './Billing';

const Dashboard = () => {
  const [page, setPage] = useState('customers');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-primary">💧 Nanadan Bottling Admin Dashboard</h2>
        <p className="text-muted">
          Manage Customers, Deliveries & Monthly Billing with ease.
        </p>
      </div>

      <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
        <button
          className={`btn btn-outline-primary ${page === 'customers' ? 'active' : ''}`}
          onClick={() => setPage('customers')}
        >
          ➕ Add Customer
        </button>
        <button
          className={`btn btn-outline-secondary ${page === 'list' ? 'active' : ''}`}
          onClick={() => setPage('list')}
        >
          👥 View Customers
        </button>
        <button
          className={`btn btn-outline-success ${page === 'delivery' ? 'active' : ''}`}
          onClick={() => setPage('delivery')}
        >
          🚚 Add Delivery
        </button>
        <button
          className={`btn btn-outline-warning ${page === 'billing' ? 'active' : ''}`}
          onClick={() => setPage('billing')}
        >
          💳 Billing
        </button>
        <button className="btn btn-danger" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      <div className="p-3 border rounded bg-light shadow-sm">
        {page === 'customers' && <AddCustomer />}
        {page === 'list' && <CustomerList />}
        {page === 'delivery' && <AddDelivery />}
        {page === 'billing' && <Billing />}
      </div>
    </div>
  );
};

export default Dashboard;
