"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

const SOURCES = ["TRT Haber", "Deniz Haber", "DHA", "gCaptain"];
const DAY_OPTIONS = [1, 3, 7, 10, 30];

export default function HomePage() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [source, setSource] = useState("");
  const [days, setDays] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadNews() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (source) params.append("source", source);
      if (days) params.append("days", days);

      try {
        const response = await fetch(`${API_URL}/api/news?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Token is missing or expired: log the user out
        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const data = await response.json();
        if (!response.ok) {
          setError(data.message);
          return;
        }

        setNews(data.news);
      } catch {
        setError("Could not connect to the server");
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, [source, days, router]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  function clearFilters() {
    setSource("");
    setDays("");
  }

  function formatDate(value) {
    if (!value) return "";
    return new Date(value).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand">Maritime News</span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row g-2 mb-4">
          <div className="col-md-4">
            <select
              className="form-select"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">All sources</option>
              {SOURCES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <select
              className="form-select"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            >
              <option value="">All dates</option>
              {DAY_OPTIONS.map((item) => (
                <option key={item} value={item}>Last {item} days</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : news.length === 0 ? (
          <p className="text-muted text-center py-5">No news found.</p>
        ) : (
          <>
            <p className="text-muted">{news.length} articles</p>

            <div className="row g-4">
              {news.map((item) => (
                <div className="col-md-6 col-lg-4" key={item._id}>
                  <div className="card h-100 shadow-sm">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        className="card-img-top"
                        alt=""
                        style={{ height: 180, objectFit: "cover" }}
                      />
                    )}

                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="badge bg-primary">{item.source}</span>
                        <small className="text-muted">{formatDate(item.published_at)}</small>
                      </div>
                      <h2 className="h6 card-title">{item.title}</h2>
                      <p className="card-text small text-muted">
                        {item.content.slice(0, 150)}...
                      </p>
                    </div>

                    <div className="card-footer bg-white border-0">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        Read more
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}