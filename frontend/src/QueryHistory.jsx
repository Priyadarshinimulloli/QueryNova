import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const QueryHistory = ({ queryHistory }) => {
  const navigate = useNavigate();
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    let filtered = queryHistory;

    // Filter by query type
    if (filterType !== "all") {
      filtered = filtered.filter((q) => q.type === filterType);
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter((q) =>
        q.query.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredHistory(filtered);
  }, [queryHistory, filterType, searchText]);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "40px 20px",
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxSizing: "border-box",
  };

  const contentStyle = {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    background: "rgba(255, 255, 255, 0.98)",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "15px",
  };

  const titleStyle = {
    fontSize: "2.5rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const backButtonStyle = {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    transition: "all 0.3s ease",
  };

  const filterContainerStyle = {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
    flexWrap: "wrap",
  };

  const filterButtonStyle = (isActive) => ({
    padding: "10px 20px",
    border: "2px solid",
    borderColor: isActive ? "#667eea" : "#e0e0e0",
    background: isActive ? "#667eea" : "white",
    color: isActive ? "white" : "#666",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  });

  const searchStyle = {
    padding: "12px 20px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "1rem",
    fontFamily: "inherit",
    width: "300px",
    maxWidth: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.3s ease",
  };

  const tableContainerStyle = {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    maxHeight: "600px",
    overflowY: "auto",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.95rem",
  };

  const thStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "16px",
    textAlign: "left",
    fontWeight: "600",
    textTransform: "uppercase",
    fontSize: "0.85rem",
    letterSpacing: "0.5px",
    position: "sticky",
    top: 0,
    zIndex: 10,
  };

  const tdStyle = {
    padding: "14px 16px",
    borderBottom: "1px solid #e0e0e0",
  };

  const queryTypeColors = {
    SELECT: { bg: "rgba(59, 130, 246, 0.1)", text: "#2563eb" },
    INSERT: { bg: "rgba(34, 197, 94, 0.1)", text: "#16a34a" },
    UPDATE: { bg: "rgba(249, 115, 22, 0.1)", text: "#ea580c" },
  };

  const getStatusBadgeStyle = (status) => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "600",
    backgroundColor: status === "success" ? "#d1fae5" : "#fee2e2",
    color: status === "success" ? "#10b981" : "#ef4444",
    textTransform: "capitalize",
  });

  const emptyStateStyle = {
    textAlign: "center",
    padding: "60px 20px",
    color: "#999",
  };

  const emptyStateIconStyle = {
    fontSize: "4rem",
    marginBottom: "20px",
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb {
            background: #667eea;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #764ba2;
          }
          tbody tr {
            transition: all 0.2s ease;
          }
          tbody tr:hover {
            background-color: #f9f9f9;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>

      <div style={contentStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>📋 Query History</h1>
          <button
            onClick={() => navigate("/")}
            style={backButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div style={filterContainerStyle}>
          {["all", "SELECT", "INSERT", "UPDATE"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={filterButtonStyle(filterType === type)}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
              }}
            >
              {type === "all" ? "All Queries" : type}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search query text..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={searchStyle}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
          />
        </div>

        {filteredHistory.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={emptyStateIconStyle}>🔍</div>
            <h2>No Queries Found</h2>
            <p>
              {queryHistory.length === 0
                ? "No query history yet. Execute some queries to see them here!"
                : "Try adjusting your filters or search term."}
            </p>
          </div>
        ) : (
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Query Type</th>
                  <th style={thStyle}>Query Text</th>
                  <th style={thStyle}>Execution Time</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((query, index) => {
                  const colors = queryTypeColors[query.type];
                  return (
                    <tr key={index}>
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            backgroundColor: colors?.bg,
                            color: colors?.text,
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            textTransform: "uppercase",
                          }}
                        >
                          {query.type}
                        </span>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          fontFamily: "'Fira Code', monospace",
                          fontSize: "0.85rem",
                          maxWidth: "400px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={query.query}
                      >
                        {query.query}
                      </td>
                      <td style={tdStyle}>
                        <strong>{query.executionTime}ms</strong>
                      </td>
                      <td style={tdStyle}>
                        <span style={getStatusBadgeStyle(query.status)}>
                          {query.status}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontSize: "0.85rem", color: "#666" }}>
                        {new Date(query.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: "30px", textAlign: "center", color: "#666" }}>
          <p>
            Total: <strong>{filteredHistory.length}</strong> queries
            {filterType !== "all" && ` (${filterType})`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QueryHistory;
