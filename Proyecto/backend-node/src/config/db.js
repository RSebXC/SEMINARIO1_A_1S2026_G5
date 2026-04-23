require('dotenv').config();
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST, port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, waitForConnections: true, connectionLimit: 10
});
async function testConnection() {
  try { const c = await pool.getConnection(); console.log('✅ RDS OK'); c.release(); }
  catch(e) { console.warn('⚠️  RDS:', e.message); }
}
module.exports = { pool, testConnection };
