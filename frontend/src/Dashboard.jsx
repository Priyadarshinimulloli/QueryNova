import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "./socket";
import QueryEditor from "./QueryEditor";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = ({ queryHistory, onQueryExecute }) => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState([]);
  const [stats, setStats] = useState({ SELECT: 0, INSERT: 0, UPDATE: 0, avgLatency: 0, total: 0, successRate: 0 });
  const LATENCY_THRESHOLD = 10; // Alert threshold in ms

  useEffect(() => {
    socket.on("query_metric", (data) => {
      setMetrics((prev) => {
        const updated = [...prev.slice(-19), data]; // keep last 20 entries
        
        // Calculate stats
        const counts = { SELECT: 0, INSERT: 0, UPDATE: 0 };
        let totalLatency = 0;
        let successful = 0;
        
        updated.forEach((m) => {
          counts[m.queryType] = (counts[m.queryType] || 0) + 1;
          totalLatency += m.latency;
          if (m.status === "success") successful++;
        });
        
        setStats({
          ...counts,
          avgLatency: (totalLatency / updated.length).toFixed(2),
          total: updated.length,
          successRate: ((successful / updated.length) * 100).toFixed(1)
        });
        return updated;
      });
    });
  }, []);

  const queryTypeColors = {
    SELECT: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 1)', text: '#2563eb' },
    INSERT: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 1)', text: '#16a34a' },
    UPDATE: { bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 1)', text: '#ea580c' }
  };

  const chartData = {
    labels: metrics.map((_, i) => `#${i + 1}`),
    datasets: [
      {
        label: "Query Latency (ms)",
        data: metrics.map((m) => m.latency),
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: metrics.map((m) => m.latency > LATENCY_THRESHOLD ? '#ef4444' : 'rgba(99, 102, 241, 1)'),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        segment: {
          borderColor: (ctx) => {
            const value = ctx.p1.parsed.y;
            return value > LATENCY_THRESHOLD ? '#ef4444' : 'rgba(99, 102, 241, 1)';
          }
        }
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 14, weight: 'bold' },
          color: '#333'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          afterLabel: (context) => {
            const metric = metrics[context.dataIndex];
            return `Type: ${metric.queryType}\nStatus: ${metric.status}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 12 },
          color: '#666'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11 },
          color: '#666'
        }
      }
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    minHeight: '100vh',
    margin: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxSizing: 'border-box'
  };

  const dashboardStyle = {
    width: '100%',
    maxWidth: '1400px',
    background: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'fadeIn 0.6s ease-in-out'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
    letterSpacing: '-0.5px'
  };

  const headerButtonsStyle = {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap'
  };

  const historyButtonStyle = {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
  };

  const subtitleStyle = {
    textAlign: 'center',
    color: '#666',
    fontSize: '1rem',
    marginBottom: '30px',
    fontWeight: '400'
  };

  const statsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  };

  const statCardStyle = (color) => ({
    background: color,
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    color: 'white',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  });

  const statLabelStyle = {
    fontSize: '0.875rem',
    opacity: '0.9',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '500'
  };

  const statValueStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    lineHeight: '1'
  };

  const chartContainerStyle = {
    height: '350px',
    marginBottom: '30px',
    background: '#fafafa',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e0e0e0'
  };

  const tableContainerStyle = {
    overflowX: 'auto',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    maxHeight: '450px',
    overflowY: 'auto'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.95rem'
  };

  const thStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: '0.85rem',
    letterSpacing: '0.5px',
    position: 'sticky',
    top: 0,
    zIndex: 10
  };

  const getRowStyle = (metric) => {
    const colors = queryTypeColors[metric.queryType];
    const isHighLatency = metric.latency > LATENCY_THRESHOLD;
    
    return {
      backgroundColor: colors ? colors.bg : '#fff',
      borderLeft: `4px solid ${colors ? colors.border : '#ddd'}`,
      transition: 'all 0.3s ease',
      animation: isHighLatency ? 'pulse 2s ease-in-out infinite' : 'none'
    };
  };

  const tdStyle = {
    padding: '14px 16px',
    borderBottom: '1px solid #e0e0e0'
  };

  const getQueryTypeBadgeStyle = (queryType) => {
    const colors = queryTypeColors[queryType];
    return {
      display: 'inline-block',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '700',
      backgroundColor: colors ? colors.bg : '#f5f5f5',
      color: colors ? colors.text : '#666',
      border: `2px solid ${colors ? colors.border : '#ddd'}`,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    };
  };

  const getStatusBadgeStyle = (status) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    backgroundColor: status === "success" ? '#d1fae5' : '#fee2e2',
    color: status === "success" ? '#10b981' : '#ef4444',
    textTransform: 'capitalize'
  });

  const getLatencyStyle = (latency) => ({
    fontWeight: '600',
    fontSize: '0.95rem',
    color: latency > LATENCY_THRESHOLD ? '#ef4444' : '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          tbody tr {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          
          tbody tr:hover {
            transform: translateX(5px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            background-color: #f9f9f9 !important;
          }
          
          .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          }

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
        `}
      </style>
      
      <div style={dashboardStyle}>
        <h1 style={titleStyle}>Live Query Simulator</h1>
        <div style={headerButtonsStyle}>
          <button
            onClick={() => navigate("/history")}
            style={historyButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            📋 View Query History ({queryHistory.length})
          </button>
        </div>
        <p style={subtitleStyle}>Real-time Database Query Performance Monitor</p>
        
        {/* SQL Query Editor */}
        <QueryEditor onQueryExecute={onQueryExecute} />
        
        <div style={statsContainerStyle}>
          <div className="stat-card" style={statCardStyle('linear-gradient(135deg, #2563eb 0%, #1e40af 100%)')}>
            <div style={statLabelStyle}>SELECT Queries</div>
            <div style={statValueStyle}>{stats.SELECT}</div>
          </div>
          <div className="stat-card" style={statCardStyle('linear-gradient(135deg, #16a34a 0%, #15803d 100%)')}>
            <div style={statLabelStyle}>INSERT Queries</div>
            <div style={statValueStyle}>{stats.INSERT}</div>
          </div>
          <div className="stat-card" style={statCardStyle('linear-gradient(135deg, #ea580c 0%, #c2410c 100%)')}>
            <div style={statLabelStyle}>UPDATE Queries</div>
            <div style={statValueStyle}>{stats.UPDATE}</div>
          </div>
          <div className="stat-card" style={statCardStyle('linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)')}>
            <div style={statLabelStyle}>Avg Latency</div>
            <div style={statValueStyle}>{stats.avgLatency} ms</div>
          </div>
          <div className="stat-card" style={statCardStyle('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')}>
            <div style={statLabelStyle}>Total Queries</div>
            <div style={statValueStyle}>{stats.total}</div>
          </div>
          <div className="stat-card" style={statCardStyle('linear-gradient(135deg, #10b981 0%, #059669 100%)')}>
            <div style={statLabelStyle}>Success Rate</div>
            <div style={statValueStyle}>{stats.successRate}%</div>
          </div>
        </div>
        
        <div style={chartContainerStyle}>
          <Line data={chartData} options={chartOptions} />
        </div>
        
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Query Type</th>
                <th style={thStyle}>Latency (ms)</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ ...tdStyle, textAlign: 'center', color: '#999', padding: '40px' }}>
                    Waiting for query metrics...
                  </td>
                </tr>
              ) : (
                metrics.map((m, i) => (
                  <tr key={i} style={getRowStyle(m)}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>
                      <span style={getQueryTypeBadgeStyle(m.queryType)}>{m.queryType}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={getLatencyStyle(m.latency)}>
                        {m.latency}
                        {m.latency > LATENCY_THRESHOLD && (
                          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={getStatusBadgeStyle(m.status)}>{m.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
