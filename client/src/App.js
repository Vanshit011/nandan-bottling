// src/App.js
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AddCustomer from './components/AddCustomer';
import CustomerList from './components/CustomerList';
import AddDelivery from './components/AddDelivery';
import ViewDeliveries from './components/ViewDeliveries';
import MonthSummary from './components/MonthSummary';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard/customers" replace />
            ) : (
              <Login onLogin={() => setIsLoggedIn(true)} />
            )
          }
        />

        {/* Dashboard layout wrapper */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="customers" replace />} />
          <Route path="customers" element={<AddCustomer />} />
          <Route path="view-customers" element={<CustomerList />} />
          <Route path="add-delivery" element={<AddDelivery />} />
          <Route path="view-deliveries" element={<ViewDeliveries />} />
          <Route path="billing" element={<MonthSummary />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
