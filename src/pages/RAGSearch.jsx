import { useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";

export default function RAGSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      Swal.fire({
        icon: "info",
        title: "Enter a Query",
        text: "Please enter a search query to continue.",
      });
      return;
    }

    setLoading(true);
    setResults([]);
    setSearchResponse(null);

    try {
      const response = await api.post(
        `/search?query=${encodeURIComponent(query)}&limit=5`
      );

      setSearchResponse(response.data);
      setResults(response.data.results || []);
    } catch (error) {
      console.error("RAG Search failed:", error);
      Swal.fire({
        icon: "error",
        title: "Search Failed",
        text:
          error.response?.data?.detail ||
          error.message ||
          "Something went wrong during search.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow-sm p-4">
        <h2 className="mb-2 text-center">RAG Search</h2>
        <p className="text-center text-muted">
          Search through your book collection using semantic search
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter your search query (e.g., genre, author, title)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>

        {/* Search Info */}
        {searchResponse && (
          <div className="mb-3">
            <p>
              <strong>Query:</strong> "{searchResponse.query}"
            </p>
            <p>
              <strong>Results found:</strong> {results.length}
            </p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 ? (
          <div className="list-group">
            {results.map((result, idx) => (
              <div
                key={result.book_id || idx}
                className="list-group-item list-group-item-action mb-2 shadow-sm"
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">{result.metadata.title}</h5>
                  <span className="badge bg-info">
                    Similarity: {(result.similarity_score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="mb-1">
                  <strong>Author:</strong> {result.metadata.author} |{" "}
                  <strong>Genre:</strong> {result.metadata.genre} |{" "}
                  <strong>Book ID:</strong> {result.metadata.book_id}
                </p>
                <p className="text-muted">{result.content}</p>
              </div>
            ))}
          </div>
        ) : (
          !loading &&
          query &&
          searchResponse && (
            <div className="alert alert-info">
              No results found for "<strong>{query}</strong>". Try searching
              different terms like genre, author names, or book titles.
            </div>
          )
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center mt-3">
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Searching through book collection...</p>
          </div>
        )}
      </div>
    </div>
  );
}
