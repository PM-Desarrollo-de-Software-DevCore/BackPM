const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
  connectionTimeout: 30000,
  requestTimeout: 30000,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function connectDB() {
  const pool = await sql.connect(config);
  console.log('Conexión exitosa a SQL Server');
  return pool;
}

module.exports = { sql, connectDB };