import express from "express";
import http from "http";
import { Server } from "socket.io";
import mysql from "mysql2/promise";

// Server setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = 5000;

// MySQL local connection
const pool = mysql.createPool({
    host: "localhost",        // local MySQL
    user: "root",             // your MySQL username
    password: "012005", // your MySQL password
    database: "load_simulator",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test DB connection
async function testDBConnection() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SELECT NOW() AS now");
        console.log("DB connected! Current time:", rows[0].now);
        connection.release();
    } catch (err) {
        console.error("DB connection error:", err);
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

// Run query simulation every 2 seconds
setInterval(simulateQuery, 2000);

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    testDBConnection();
});

// Socket.IO basic setup
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
