import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { addBook } from "../../api/books";

export default function AddBook() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [book, setBook] = useState({
    title: "",
    author: "",
    genre: "",
    year_published: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook((prev) => ({
      ...prev,
      [name]: name === "year_published" ? parseInt(value) || "" : value
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!book.title || !book.author) {
      Swal.fire({
        icon: "warning",
        title: "Missing Required Fields",
        text: "Title and Author are required.",
        confirmButtonColor: "#0d6efd"
      });
      return;
    }

    setLoading(true);

    Swal.fire({
      title: "Saving Book",
      text: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      await addBook(book);

      Swal.fire({
        icon: "success",
        title: "Book Added Successfully",
        text: "Redirecting to book list...",
        timer: 1500,
        showConfirmButton: false
      });

      setTimeout(() => navigate("/books"), 1500);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed to Add Book",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#dc3545"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">

      {/* 🔹 PAGE HEADER */}
      <div className="mb-4">
        <h3 className="fw-semibold mb-1">Add New Book</h3>
        <p className="text-muted mb-3">
          Fill in the details below to add a new book to the library collection.
        </p>

        {/* 🔹 BREADCRUMB */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/books" className="text-decoration-none">
                <i className="bi bi-book me-1"></i> Books
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Add Book
            </li>
          </ol>
        </nav>
      </div>

      {/* 🔹 CARD FORM */}
      <div className="card shadow-sm mx-auto" style={{ maxWidth: "600px" }}>
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-plus-circle me-2"></i>
            Book Information
          </h5>
        </div>

        <div className="card-body">
          <form onSubmit={submit} className="row g-3">

            <div className="col-12">
              <label className="form-label">Book Title*</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={book.title}
                onChange={handleChange}
                placeholder="Enter Book Title Here"
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Author*</label>
              <input
                type="text"
                className="form-control"
                name="author"
                value={book.author}
                onChange={handleChange}
                placeholder="Enter Author Name Here"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Genre</label>
              <input
                type="text"
                className="form-control"
                name="genre"
                value={book.genre}
                onChange={handleChange}
                placeholder="Ex. Sci-Fi"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Published Year</label>
              <input
                type="number"
                className="form-control"
                name="year_published"
                value={book.year_published}
                onChange={handleChange}
                placeholder="Ex. 2024"
                min="1000"
                max="2025"
              />
            </div>

            <div className="col-12 text-end">
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>
                    Add Book
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
