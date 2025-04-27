// backend/db.js
const sql = require('mssql');

// Cấu hình thông tin kết nối
const config = {
  server: 'localhost',                    // Thử dùng localhost thay vì tên instance
  database: 'CuoiKyWeb',
  user: 'sa',                              // Thay bằng username của bạn
  password: '123',                      // Thay bằng password của bạn
  options: {
    encrypt: false,                      // Tắt mã hóa
    trustServerCertificate: true,        
    enableArithAbort: true
  }
};

// Tạo pool kết nối
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('❌ Database Connection Failed:', err);
    throw err;
  });

module.exports = { sql, poolPromise };