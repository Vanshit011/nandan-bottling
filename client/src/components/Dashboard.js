import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/Sidebar.css';

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const navRef = useRef(null); // Ref for the nav element

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu if click outside nav when menu is open
  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <>
      {/* Fixed Top Navbar */}
      <header className="top-navbar">
        <div className="navbar-container">
          <h4 className="navbar-brand">💧Drinking Water</h4>

          {/* Hamburger menu button for mobile */}
          <button
            className="navbar-toggle d-md-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          {/* Navigation Links */}
          <nav
            ref={navRef}
            className={`navbar-links ${menuOpen ? 'open' : ''}`}
          >
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
            <NavLink
              to="/dashboard/bills"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              📄payment details
            </NavLink>
            <button
              className="btn btn-danger logout-btn"
              onClick={handleLogout}
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
