import { useEffect, useState } from "react";
import { getBooks, deleteBook, getBookById } from "../api/books";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loadingBook, setLoadingBook] = useState(false);

  const handleView = async (id) => {
    setShowModal(true);
    setLoadingBook(true);
    setSelectedBook(null);

    try {
      const res = await getBookById(id);

      if (res?.data) {
        setSelectedBook(res.data);
      } else {
        throw new Error("Book not found");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load book details");
      setShowModal(false);
    } finally {
      setLoadingBook(false);
    }
  };



  const loadBooks = async () => {
    try {
      const res = await getBooks();
      setBooks(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load books", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  /* ---------- Delete with SweetAlert ---------- */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This book will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteBook(id);
      Swal.fire("Deleted!", "Book deleted successfully", "success");
      loadBooks();
    } catch (err) {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  /* ---------- Filters ---------- */
  const genres = ["all", ...new Set(books.map(b => b.genre).filter(Boolean))];

  const filteredBooks = books.filter(b => {
    const matchSearch =
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase());

    const matchGenre = genre === "all" || b.genre === genre;
    return matchSearch && matchGenre;
  });

  /* ---------- Table Columns ---------- */
  const columns = [
    { name: "Title", selector: row => row.title, sortable: true },
    { name: "Author", selector: row => row.author, sortable: true },
    { name: "Genre", selector: row => row.genre || "N/A" },
    { name: "Year", selector: row => row.year_published || "N/A" },
    {
      name: "Actions",
      cell: row => (
        <div className="btn-group btn-group-sm">
          <button
            className="btn btn-outline-primary"
            onClick={() => handleView(row.id)}
          >
            <i className="bi bi-eye me-1"></i> View
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={() => handleDelete(row.id)}
          >
            <i className="bi bi-trash me-1"></i> Delete
          </button>
        </div>
      ),
      center: true,
    },
  ];



  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">

        {/* LEFT : TITLE + BREADCRUMB */}
        <div>
          <h3 className="fw-semibold mb-1">
            <i className="bi bi-book-half text-primary me-2"></i>
            Book Management
          </h3>

          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/books" className="text-decoration-none">
                  <i className="bi bi-house-door me-1"></i>
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Books
              </li>
            </ol>
          </nav>
        </div>

        {/* RIGHT : ADD BUTTON (same as before) */}
        <div>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/add-book")}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Add Book
          </button>
        </div>

      </div>





      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h6>Total Books</h6>
              <h4>{books.length}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h6>Authors</h6>
              <h4>{new Set(books.map(b => b.author)).size}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h6>Genres</h6>
              <h4>{genres.length - 1}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body row g-3">
          <div className="col-md-6 col-lg-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search by title or author"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-md-4 col-lg-3">
            <select
              className="form-select"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              {genres.map(g => (
                <option key={g} value={g}>
                  {g === "all" ? "All Genres" : g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>


      {/* Table */}
      <div className="card">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={filteredBooks}
            progressPending={loading}
            pagination
            highlightOnHover
            striped
            noDataComponent="No books found"
          />
        </div>
      </div>

      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-book me-2"></i>
                    Book Details
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  {loadingBook && (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary"></div>
                      <p className="mt-2">Loading book details...</p>
                    </div>
                  )}

                  {!loadingBook && selectedBook && (
                    <>
                      <p><strong>Title:</strong> {selectedBook.title}</p>
                      <p><strong>Author:</strong> {selectedBook.author}</p>
                      <p><strong>Genre:</strong> {selectedBook.genre || "N/A"}</p>
                      <p><strong>Year:</strong> {selectedBook.year_published || "N/A"}</p>

                      {selectedBook.summary && (
                        <div className="mt-3">
                          <strong>Summary:</strong>
                          <div className="border rounded p-3 bg-light mt-1">
                            {selectedBook.summary}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}


    </div>
  );
}
