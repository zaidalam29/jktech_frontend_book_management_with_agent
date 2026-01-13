import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load documents
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/documents");
      setDocuments(Array.isArray(response.data) ? response.data : []);
      setErrorMessage(null);
    } catch (error) {
      setDocuments([]);
      setErrorMessage(`Failed to load documents: ${error.response?.status || "Network Error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Delete document
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/documents/${id}`);
        await fetchDocuments();
        Swal.fire("Deleted!", "Document has been deleted.", "success");
      } catch (error) {
        Swal.fire(
          "Failed",
          `Delete failed: ${error.response?.status || "Network Error"}`,
          "error"
        );
      }
    }
  };

  // Download document
  const handleDownload = async (id, filename) => {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || `document-${id}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire(
        "Download Failed",
        `Could not download: ${error.response?.status || "Network Error"}`,
        "error"
      );
    }
  };

  // Upload document
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      Swal.fire("Error", "Please select a file to upload", "warning");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      await api.post("/documents/upload", formData);
      setSelectedFile(null);
      document.querySelector('input[type="file"]').value = "";
      await fetchDocuments();
      Swal.fire("Success", "File uploaded successfully", "success");
    } catch (error) {
      Swal.fire(
        "Upload Failed",
        error.response?.data?.detail || "Network Error",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  // Table columns
  const columns = [
    {
      name: "Document Name",
      selector: (row) => row.filename || "Unknown",
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "Size",
      selector: (row) => {
        const size = row.file_size;
        if (!size) return "Unknown";
        if (typeof size === "number") {
          if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
          if (size > 1024) return `${(size / 1024).toFixed(1)} KB`;
          return `${size} bytes`;
        }
        return size.toString();
      },
      sortable: true,
      width: "120px",
    },
    {
      name: "Uploaded At",
      selector: (row) => (row.uploaded_at ? new Date(row.uploaded_at).toLocaleDateString() : "Unknown"),
      sortable: true,
      width: "140px",
    },
    {
      name: "Status",
      width: "100px",
      cell: (row) => (
        <span
          className={`badge rounded-pill bg-${
            (row.status || "active").toLowerCase() === "active" ? "success" : "secondary"
          }`}
        >
          {row.status || "Active"}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      width: "220px",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-primary d-flex align-items-center"
            onClick={() => handleDownload(row.id, row.filename)}
          >
            <i className="bi bi-download me-1"></i> Download
          </button>
          <button
            className="btn btn-sm btn-danger d-flex align-items-center"
            onClick={() => handleDelete(row.id)}
          >
            <i className="bi bi-trash me-1"></i> Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mt-4">
      {/* Breadcrumb + Header outside card */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h3 className="fw-bold mb-1">
            <i className="bi bi-folder2-open me-2"></i> Document Management
          </h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none">
                  <i className="bi bi-house me-1"></i> Home
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Documents
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Card containing upload form + table */}
      <div className="card p-3">
        {/* Upload Section */}
        <form className="mb-3" onSubmit={handleFileUpload}>
          <div className="input-group">
            <input
              type="file"
              className="form-control"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              disabled={uploading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="bi bi-upload me-1"></i> Upload
                </>
              )}
            </button>
          </div>
          {selectedFile && (
            <small className="text-muted mt-1 d-block">
              Selected: {selectedFile.name}
            </small>
          )}
        </form>

        {/* Error Message */}
        {errorMessage && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center">
            {errorMessage}
            <button className="btn btn-sm btn-outline-light" onClick={fetchDocuments}>
              Retry
            </button>
          </div>
        )}

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={documents}
          pagination
          paginationPerPage={10}
          progressPending={loading}
          highlightOnHover
          striped
          responsive
          noDataComponent="No documents found. Upload a document to get started."
        />
      </div>
    </div>
  );
}
