// backend/db.js
const sql = require('mysql2/promise');
require('dotenv').config();
// Cấu hình thông tin kết nối
const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER, // Thay bằng username MySQL của bạn
  password: process.env.DB_PASSWORD, // Thay bằng password MySQL của bạn
  database: process.env.DB_NAME, // Tên database của bạn
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  };

// Tạo pool kết nối
const poolPromise = new sql.createPool(config)
  
if (poolPromise) {console.log('✅ Connected to SQL Server');
}
else {
  console.error('❌ Database Connection Failed:', err);
  throw err;
};

module.exports = { sql, poolPromise };