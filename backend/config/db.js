// backend/db.js
const sql = require('mssql');

// Cấu hình thông tin kết nối
const config = {
  user: 'sa',      // tài khoản SQL Server
  password: '123',  // mật khẩu SQL Server
  server: 'localhost',        // hoặc IP/hostname của server
  database: 'CuoiKyWeb',  // tên database
  options: {
    encrypt: false,             // true nếu dùng Azure SQL
    trustServerCertificate: true, // để tránh lỗi SSL khi dev local
  },
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