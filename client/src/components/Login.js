import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // 🔹 Added loading state
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && window.location.pathname !== "/dashboard") {
      navigate("/dashboard/customers");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // 🔹 Start loading

    try {
      const response = await axios.post(
        "https://api-nandan-node.onrender.com/api/admin/login",
        { email, password }
      );

      const { token, companyId } = response.data;

      if (token && companyId) {
        localStorage.setItem("token", token);
        localStorage.setItem("companyId", companyId);
        navigate("/dashboard/customers");
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false); // 🔹 Stop loading
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{ backgroundColor: "#e3f2fd" }}
    >
      <div className="card shadow" style={{ maxWidth: "380px", width: "100%" }}>
        <div className="card-body p-4 bg-primary text-white rounded">
          <h3 className="card-title text-center mb-4 fw-bold user-select-none">
            Water Supply Login
          </h3>

          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {/* 🔹 Button with loading state */}
            <button
              type="submit"
              className="btn btn-light w-100 fw-bold"
              disabled={loading} // disable when processing
            >
              {loading ? "Processing...." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
