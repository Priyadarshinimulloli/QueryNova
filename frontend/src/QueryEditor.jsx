import React, { useState } from "react";

const QueryEditor = ({ onQueryExecute }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [queryType, setQueryType] = useState(null);

  // Detect query type and validate
  const detectAndValidateQuery = (queryString) => {
    const trimmedQuery = queryString.trim().toUpperCase();
    
    // Extract the first SQL keyword
    const keywords = trimmedQuery.match(/^(\w+)/);
    if (!keywords) return null;
    
    const detectedType = keywords[1];
    
    // Allowed query types
    const allowedTypes = ["SELECT", "INSERT", "UPDATE"];
    
    // Reject dangerous operations
    const blockedTypes = ["DELETE", "DROP", "TRUNCATE", "ALTER", "GRANT", "REVOKE"];
    
    return {
      type: detectedType,
      isAllowed: allowedTypes.includes(detectedType),
      isBlocked: blockedTypes.includes(detectedType),
      errorMessage: getErrorMessage(detectedType, allowedTypes, blockedTypes)
    };
  };

  // Get friendly error message
  const getErrorMessage = (queryType, allowedTypes, blockedTypes) => {
    if (blockedTypes.includes(queryType)) {
      return `⛔ ${queryType} queries are not allowed for security reasons.`;
    }
    return `❌ Unsupported query type. Only ${allowedTypes.join(", ")} queries are allowed.`;
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      setError("Please enter a SQL query");
      setQueryType(null);
      return;
    }

    // Validate query before execution
    const validation = detectAndValidateQuery(query);
    
    if (!validation) {
      setError("Invalid SQL query format");
      setQueryType(null);
      return;
    }

    setQueryType(validation.type);

    if (!validation.isAllowed) {
      setError(validation.errorMessage);
      setResults(null);
      return;
    }

    setIsExecuting(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("http://localhost:5000/execute-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
        // Call parent callback with query history data
        if (onQueryExecute) {
          onQueryExecute({
            query: query.trim(),
            executionTime: data.executionTime,
            status: "success",
          });
        }
      } else {
        setError(data.error || "Query execution failed");
        // Call parent callback with error
        if (onQueryExecute) {
          onQueryExecute({
            query: query.trim(),
            executionTime: 0,
            status: "error",
          });
        }
      }
    } catch (err) {
      setError("Failed to connect to server: " + err.message);
      if (onQueryExecute) {
        onQueryExecute({
          query: query.trim(),
          executionTime: 0,
          status: "error",
        });
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Execute on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      executeQuery();
    }
  };

  const clearQuery = () => {
    setQuery("");
    setResults(null);
    setError(null);
    setQueryType(null);
  };

  const editorContainerStyle = {
    background: "rgba(255, 255, 255, 0.98)",
    borderRadius: "16px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
    border: "1px solid #e0e0e0",
  };

  const titleStyle = {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const textareaStyle = {
    width: "100%",
    minHeight: "150px",
    padding: "15px",
    fontSize: "1rem",
    fontFamily: "'Fira Code', 'Courier New', monospace",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    resize: "vertical",
    transition: "border-color 0.3s ease",
    backgroundColor: "#fafafa",
    outline: "none",
  };

  const buttonContainerStyle = {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  };

  const buttonStyle = (variant = "primary") => ({
    padding: "12px 24px",
    fontSize: "1rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: isExecuting ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background:
      variant === "primary"
        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        : "#f5f5f5",
    color: variant === "primary" ? "white" : "#666",
    opacity: isExecuting ? 0.6 : 1,
  });

  const resultsContainerStyle = {
    marginTop: "20px",
    background: "#fafafa",
    borderRadius: "8px",
    padding: "20px",
    border: "1px solid #e0e0e0",
  };

  const errorStyle = {
    marginTop: "15px",
    padding: "15px",
    background: "#fee2e2",
    color: "#dc2626",
    borderRadius: "8px",
    border: "1px solid #fca5a5",
    fontWeight: "500",
  };

  const successStyle = {
    marginTop: "15px",
    padding: "15px",
    background: "#d1fae5",
    color: "#059669",
    borderRadius: "8px",
    border: "1px solid #6ee7b7",
    fontWeight: "500",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
    fontSize: "0.9rem",
  };

  const thStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "12px",
    textAlign: "left",
    fontWeight: "600",
    textTransform: "uppercase",
    fontSize: "0.85rem",
  };

  const tdStyle = {
    padding: "10px 12px",
    borderBottom: "1px solid #e0e0e0",
    color: "#333",
  };

  const hintStyle = {
    fontSize: "0.85rem",
    color: "#999",
    marginTop: "8px",
    fontStyle: "italic",
  };

  const queryTypeIndicatorStyle = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "0.85rem",
    fontWeight: "600",
    marginTop: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const getQueryTypeColor = (type) => {
    switch (type) {
      case "SELECT":
        return { bg: "#dbeafe", color: "#1e40af" };
      case "INSERT":
        return { bg: "#dcfce7", color: "#15803d" };
      case "UPDATE":
        return { bg: "#fed7aa", color: "#c2410c" };
      default:
        return { bg: "#f3f4f6", color: "#6b7280" };
    }
  };

  return (
    <div style={editorContainerStyle}>
      <h2 style={titleStyle}>
        <span>💻</span> SQL Query Editor
      </h2>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your SQL query here... (e.g., SELECT * FROM query_metrics LIMIT 10)"
        style={textareaStyle}
        onFocus={(e) => (e.target.style.borderColor = "#667eea")}
        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
      />

      <p style={hintStyle}>
        💡 Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to execute
      </p>

      {queryType && (
        <div style={{
          ...queryTypeIndicatorStyle,
          ...getQueryTypeColor(queryType)
        }}>
          🔍 Detected: {queryType}
        </div>
      )}

      <div style={buttonContainerStyle}>
        <button
          onClick={executeQuery}
          disabled={isExecuting}
          style={buttonStyle("primary")}
          onMouseEnter={(e) => {
            if (!isExecuting) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          {isExecuting ? "⏳ Executing..." : "▶️ Execute Query"}
        </button>

        <button
          onClick={clearQuery}
          disabled={isExecuting}
          style={buttonStyle("secondary")}
          onMouseEnter={(e) => {
            if (!isExecuting) {
              e.target.style.background = "#e5e5e5";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#f5f5f5";
          }}
        >
          🗑️ Clear
        </button>
      </div>

      {error && <div style={errorStyle}>❌ Error: {error}</div>}

      {results && (
        <div style={resultsContainerStyle}>
          <div style={successStyle}>
            ✅ Query executed successfully in {results.executionTime}ms
            {results.affectedRows !== undefined &&
              ` • ${results.affectedRows} row(s) affected`}
          </div>

          {results.data && results.data.length > 0 && (
            <div style={{ overflowX: "auto", marginTop: "15px" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    {Object.keys(results.data[0]).map((key) => (
                      <th key={key} style={thStyle}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.data.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        backgroundColor: i % 2 === 0 ? "white" : "#f9f9f9",
                      }}
                    >
                      {Object.values(row).map((val, j) => (
                        <td key={j} style={tdStyle}>
                          {val !== null && val !== undefined
                            ? String(val)
                            : "NULL"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <p
                style={{
                  marginTop: "10px",
                  fontSize: "0.85rem",
                  color: "#666",
                  textAlign: "right",
                }}
              >
                Showing {results.data.length} row(s)
              </p>
            </div>
          )}

          {results.data && results.data.length === 0 && (
            <p style={{ marginTop: "15px", color: "#666", fontStyle: "italic" }}>
              Query executed successfully but returned no data.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QueryEditor;
