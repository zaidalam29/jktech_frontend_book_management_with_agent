import { useEffect, useState } from "react";
import api from "../../api/axios";
import Swal from "sweetalert2";

export default function Ingestion() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [stats, setStats] = useState({
    totalBooks: 0,
    processedToday: 0,
    failedJobs: 0,
  });

  useEffect(() => {
    loadBookData();
  }, []);

  const loadBookData = async () => {
    try {
      const res = await api.get("/documents"); // ya /books agar API alag hai
      const data = res.data || [];
      setBooks(data);

      const jobPromises = data.slice(0, 5).map(async (book) => {
        try {
          const statusRes = await api.get(`/ingestion/status/${book.id}`);
          const status = statusRes.data.status || "pending";
          return {
            id: book.id,
            name: `Processing ${book.filename}`,
            status,
            progress:
              status === "completed"
                ? 100
                : status === "running"
                ? 75
                : status === "failed"
                ? 45
                : 0,
            startTime: new Date(book.uploaded_at).toLocaleString(),
          };
        } catch {
          return {
            id: book.id,
            name: `Processing ${book.filename}`,
            status: "pending",
            progress: 0,
            startTime: new Date(book.uploaded_at).toLocaleString(),
          };
        }
      });

      const jobs = await Promise.all(jobPromises);
      setJobs(jobs);

      const total = data.length;
      const todayStr = new Date().toDateString();
      const processedToday = data.filter(
        (b) => new Date(b.uploaded_at).toDateString() === todayStr
      ).length;
      const failedJobs = jobs.filter((j) => j.status === "failed").length;

      setStats({ totalBooks: total, processedToday, failedJobs });
    } catch (error) {
      console.error("Failed to load book data:", error);
      Swal.fire({
        icon: "info",
        title: "Info",
        text: "Failed to load book data. Showing mock data.",
      });

      // fallback mock data
      setJobs([
        { id: 1, name: "PDF Book Processing", status: "Running", progress: 75, startTime: "2024-01-15 10:30" },
        { id: 2, name: "Text Extraction", status: "Completed", progress: 100, startTime: "2024-01-15 09:15" },
        { id: 3, name: "Index Building", status: "Failed", progress: 45, startTime: "2024-01-15 08:00" },
      ]);
      setStats({ totalBooks: 1234, processedToday: 56, failedJobs: 3 });
    }
  };

  const startBookIngestion = async () => {
    if (!selectedBook) {
      Swal.fire({
        icon: "info",
        title: "Info",
        text: "Please select a book to ingest",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/ingestion/trigger/${selectedBook}`);
      Swal.fire({
        icon: "success",
        title: "Book Ingestion Started",
        text: `Job ID: ${res.data.job_id}`,
        timer: 2000,
        showConfirmButton: false,
      });
      await loadBookData();
    } catch (err) {
      console.error("Failed to start book ingestion:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to start book ingestion. Backend not available.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow p-4">
        <h2 className="mb-4 text-center">Book Ingestion</h2>

        {/* Book selection + start button */}
        <div className="d-flex gap-2 mb-4 justify-content-center">
          <select
            className="form-select"
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            style={{ minWidth: "250px" }}
          >
            <option value="">Select book...</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.filename}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={startBookIngestion}
            disabled={loading || !selectedBook}
          >
            {loading ? "Starting..." : "Start Book Ingestion"}
          </button>
        </div>

        {/* Stats */}
        <div className="row text-center mb-4">
          <div className="col-md-4 mb-2">
            <div className="card bg-light p-3">
              <h5>Total Books</h5>
              <h3>{stats.totalBooks.toLocaleString()}</h3>
            </div>
          </div>
          <div className="col-md-4 mb-2">
            <div className="card bg-light p-3">
              <h5>Processed Today</h5>
              <h3>{stats.processedToday}</h3>
            </div>
          </div>
          <div className="col-md-4 mb-2">
            <div className="card bg-light p-3">
              <h5>Failed Jobs</h5>
              <h3>{stats.failedJobs}</h3>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <h4 className="mb-3">Recent Book Jobs</h4>
        <div className="list-group">
          {jobs.map((job) => (
            <div key={job.id} className="list-group-item mb-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h6 className="mb-1">{job.name}</h6>
                  <small>Started: {job.startTime}</small>
                </div>
                <span
                  className={`badge bg-${
                    job.status.toLowerCase() === "failed"
                      ? "danger"
                      : job.status.toLowerCase() === "running"
                      ? "info"
                      : "success"
                  }`}
                >
                  {job.status}
                </span>
              </div>
              <div className="progress" style={{ height: "20px" }}>
                <div
                  className={`progress-bar ${
                    job.status.toLowerCase() === "failed"
                      ? "bg-danger"
                      : job.status.toLowerCase() === "running"
                      ? "bg-info"
                      : "bg-success"
                  }`}
                  role="progressbar"
                  style={{ width: `${job.progress}%` }}
                  aria-valuenow={job.progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {job.progress}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
