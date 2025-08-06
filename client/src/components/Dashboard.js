// src/components/Dashboard.js
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/Sidebar.css';  // You can rename this to Navbar.css or keep it

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';  // Redirect + full page reload
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      {/* Fixed Top Navbar */}
      <header className="top-navbar">
        <div className="navbar-container">
          <h4 className="navbar-brand">💧 Uma Vanshi Drinking Water</h4>

          {/* Hamburger menu button for mobile */}
          <button
            className="navbar-toggle d-md-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          {/* Navigation Links */}
          <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <NavLink
              to="/dashboard/customers"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              ➕ Add Customer
            </NavLink>
            <NavLink
              to="/dashboard/view-customers"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              👥 View Customers
            </NavLink>
            <NavLink
              to="/dashboard/add-delivery"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              🚚 Add Delivery
            </NavLink>
            <NavLink
              to="/dashboard/view-deliveries"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              📦 View Deliveries
            </NavLink>
            <NavLink
              to="/dashboard/billing"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              💳 Billing
            </NavLink>
            <button
              className="btn btn-danger logout-btn"
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/';
              }}
            >
              🚪 Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="container py-4">
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default Dashboard;
