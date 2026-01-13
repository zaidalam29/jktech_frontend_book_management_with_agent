import { useState } from "react";
import { login } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter username and password",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await login(form); // token save inside api/auth.js

      if (res.access_token || res.token) {
        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: `Welcome, ${form.username}!`,
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/books"); // redirect after successful login
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Invalid username or password",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card shadow p-4" style={{ maxWidth: "400px", margin: "80px auto" }}>
        <h2 className="text-center mb-4">Login</h2>

        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button className="btn btn-primary w-100 mb-3" onClick={submit} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-muted">
          Don't have an account?{" "}
          <Link to="/register" className="text-decoration-none">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
