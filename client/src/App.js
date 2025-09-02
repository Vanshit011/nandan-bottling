import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AddCustomer from './components/AddCustomer';
import CustomerList from './components/CustomerList';
import AddDelivery from './components/AddDelivery';
import ViewDeliveries from './components/ViewDeliveries';
import MonthSummary from './components/MonthSummary';
import Bills from './components/Bills';

function App() {
  const [_, setDummy] = useState(false); // dummy state just to force re-render on login

  // This function is passed to Login component to update auth state on successful login
  const onLogin = () => {
    setDummy((prev) => !prev); // just toggle dummy state to re-render App
  };

  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/" replace />;
  };

  const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? <Navigate to="/dashboard/add-delivery" replace /> : children;
  };

  return (
    <Router>
      <Routes>
        {/* Public route - login page */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login onLogin={onLogin} />
            </PublicRoute>
          }
        />

        {/* Protected dashboard routes */}
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
          <Route path="bills" element={<Bills />} />
        </Route>

        {/* Catch all - redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
