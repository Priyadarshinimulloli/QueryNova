import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import QueryHistory from "./QueryHistory";

function App() {
  const [queryHistory, setQueryHistory] = useState([]);

  const handleQueryExecute = (data) => {
    if (!data || !data.query) return;
    
    const queryType = data.query.trim().split(" ")[0].toUpperCase();
    const newQuery = {
      query: data.query,
      type: queryType,
      executionTime: data.executionTime || 0,
      status: data.status || "unknown",
      timestamp: new Date().toISOString(),
    };
    setQueryHistory((prev) => [newQuery, ...prev].slice(0, 100)); // Keep last 100
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              queryHistory={queryHistory}
              onQueryExecute={handleQueryExecute}
            />
          }
        />
        <Route path="/history" element={<QueryHistory queryHistory={queryHistory} />} />
      </Routes>
    </Router>
  );
}

export default App;
