import express from "express";
import http from "http";
import { Server } from "socket.io";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Server setup
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = parseInt(process.env.PORT, 10) || 5000;

// MySQL local connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "load_simulator",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT, 10) || 0
});

// Initialize database schema
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        
        // Create query_metrics table if it doesn't exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS query_metrics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                query_type VARCHAR(50) NOT NULL,
                latency_ms INT NOT NULL,
                status VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await connection.query(createTableQuery);
        console.log("✅ Database schema initialized");
        connection.release();
    } catch (err) {
        console.error("❌ Database initialization error:", err.message);
    }
}

// Test DB connection
async function testDBConnection() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SELECT NOW() AS now");
        console.log("✅ DB connected! Current time:", rows[0].now);
        connection.release();
    } catch (err) {
        console.error("❌ DB connection error:", err.message);
    }
}
// Simulate random query execution
async function simulateQuery() {
    const queryTypes = ["SELECT", "INSERT", "UPDATE"];
    const queryType = queryTypes[Math.floor(Math.random() * queryTypes.length)];

    const startTime = Date.now();
    let status = "success";

    try {
        const connection = await pool.getConnection();

        let insertedId;

        if (queryType === "SELECT") {
            await connection.query("SELECT COUNT(*) AS count FROM query_metrics");
        } else if (queryType === "INSERT") {
            const [result] = await connection.query(
                "INSERT INTO query_metrics (query_type, latency_ms, status) VALUES (?, ?, ?)",
                [queryType, 0, "success"]
            );
            insertedId = result.insertId; // get the inserted row ID
        } else if (queryType === "UPDATE") {
            // For simulation, insert a new row instead of updating
            const [result] = await connection.query(
                "INSERT INTO query_metrics (query_type, latency_ms, status) VALUES (?, ?, ?)",
                [queryType, 0, "success"]
            );
            insertedId = result.insertId;
        }

        const latency = Date.now() - startTime;

        // Update latency for inserted row (INSERT or UPDATE)
        if (insertedId) {
            await connection.query(
                "UPDATE query_metrics SET latency_ms = ? WHERE id = ?",
                [latency, insertedId]
            );
        }

        connection.release();

        // Emit live metrics
        io.emit("query_metric", { queryType, latency, status });
        console.log(`Query: ${queryType}, Latency: ${latency}ms, Status: ${status}`);
    } catch (err) {
        console.error("Query simulation error:", err);
        status = "error";
    }
}

// Run query simulation every QUERY_INTERVAL_MS (default 2000ms)
const QUERY_INTERVAL_MS = parseInt(process.env.QUERY_INTERVAL_MS, 10) || 2000;
setInterval(simulateQuery, QUERY_INTERVAL_MS);

// API endpoint to execute custom SQL queries
app.post("/execute-query", async (req, res) => {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required and must be a string" });
    }

    const startTime = Date.now();

    try {
        const connection = await pool.getConnection();
        
        // Execute the query
        const [results] = await connection.query(query);
        
        const executionTime = Date.now() - startTime;
        
        connection.release();

        // Determine query type
        const queryType = query.trim().split(" ")[0].toUpperCase();
        
        // Emit live metric for the executed query
        io.emit("query_metric", { 
            queryType, 
            latency: executionTime, 
            status: "success" 
        });

        // Return results based on query type
        if (queryType === "SELECT" || queryType === "SHOW" || queryType === "DESCRIBE" || queryType === "DESC") {
            return res.json({
                success: true,
                data: results,
                executionTime,
                rowCount: results.length
            });
        } else {
            // For INSERT, UPDATE, DELETE, etc.
            return res.json({
                success: true,
                executionTime,
                affectedRows: results.affectedRows || 0,
                insertId: results.insertId || null,
                message: `Query executed successfully`
            });
        }
    } catch (err) {
        const executionTime = Date.now() - startTime;
        
        console.error("Query execution error:", err.message);
        
        // Emit error metric
        const queryType = query.trim().split(" ")[0].toUpperCase();
        io.emit("query_metric", { 
            queryType, 
            latency: executionTime, 
            status: "error" 
        });

        return res.status(500).json({
            error: err.message,
            code: err.code,
            executionTime
        });
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    testDBConnection();
    initializeDatabase();
});

// Socket.IO basic setup
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
