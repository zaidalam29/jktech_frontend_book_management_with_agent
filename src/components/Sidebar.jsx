import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { logout } from "../api/auth";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { path: "/books", label: "Books" },
    { path: "/add-book", label: "Add Book" },
    { path: "/documents", label: "Documents" },
    { path: "/ingestion", label: "Ingestion" },
    { path: "/rag", label: "RAG Search" },
    { path: "/summary", label: "Summary" },
    { path: "/admin/users", label: "Admin Panel" },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <aside
        className={`bg-dark text-white p-3 ${
          open ? "d-block" : "d-none d-md-block"
        }`}
        style={{ width: "240px" }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">Book Manager Pro</h5>
          <button
            className="btn btn-sm btn-outline-light d-md-none"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <ul className="nav nav-pills flex-column gap-1">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${
                  isActive(item.path)
                    ? "active bg-primary"
                    : "text-white"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div className="mt-auto pt-4">
          <button
            className="btn btn-outline-danger w-100"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Mobile top bar */}
        <div className="d-md-none p-2 border-bottom">
          <button
            className="btn btn-dark"
            onClick={() => setOpen(true)}
          >
            ☰ Menu
          </button>
        </div>

        <div className="p-4">
          {/* Page content here */}
        </div>
      </div>
    </div>
  );
}
