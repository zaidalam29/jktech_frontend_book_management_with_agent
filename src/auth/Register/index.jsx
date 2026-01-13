import { useState } from "react";
import { register } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Frontend validation
    if (!form.username.trim() || !form.password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter both username and password",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await register(form);

      // Save user info in localStorage
      localStorage.setItem("user", JSON.stringify({ username: form.username }));

      Swal.fire({
        icon: "success",
        title: "Register Successful",
        text: `Welcome, ${form.username}!`,
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/login"); // Redirect to login after register
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Register Failed",
        text: error?.response?.data?.message || "Username may already exist",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card shadow-sm p-4" style={{ maxWidth: "400px", margin: "50px auto" }}>
        <h2 className="mb-3 text-center">Register</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username *</label>
            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="Enter username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Signing up..." : "Register"}
          </button>
        </form>

        {/* Login link below button */}
        <p className="mt-3 text-center text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-decoration-none">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
