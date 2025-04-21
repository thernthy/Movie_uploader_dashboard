import mysql from "mysql2/promise";

// Validate environment variables
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: 3306,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = {
  query: async (query, params) => {
    try {
      const [rows, fields] = await pool.execute(query, params);
      return [rows, fields];
    } catch (error) {
      console.error("Database query error:", error);
      throw new Error("Database query failed");
    }
  },
};
