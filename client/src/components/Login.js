// src/components/Login.js
import { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const res = await axios.post('http://localhost:5000/api/admin/login', { email, password });
  //     localStorage.setItem('token', res.data.token);
  //     onLogin();
  //   } catch (err) {
  //     alert('Login Failed');
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Clear previous login data
      localStorage.removeItem('token');

      // ✅ Login Request
      const res = await axios.post('http://localhost:5000/api/admin/login', { email, password });

      // ✅ Save New Token
      localStorage.setItem('token', res.data.token);

      // ✅ Redirect to Dashboard
      onLogin();
    } catch (err) {
      alert('Login Failed');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100 bg-light">
      <form onSubmit={handleSubmit} className="border p-4 rounded shadow-lg bg-white" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <h2 className="text-primary fw-bold">Water Supplier Login</h2>
          <p className="text-muted">Access Your Admin Dashboard</p>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Email Address</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary w-100" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;