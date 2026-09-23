
## 📥 1. Clone dự án

```bash
git clone https://github.com/duytoan11123/CuoikyWeb.git
cd CuoikyWeb
cd frontend
npm install
cd ../backend
npm install
```
🗄️ 2. Import cơ sở dữ liệu
Bước 1: Tạo database (nếu chưa có) CREATE DATABASE cuoiKyWeb
Bước 2: Import từ file SQL 
```
cd backend
mysql -u root -p cuoiKyWeb < ./database/init.sql
```

⚙️ 3. Tạo file cấu hình .env
Tạo file .env trong thư mục backend:
```



DB_HOST=localhost
DB_USER='root' 
DB_PASSWORD='toanproqn12'
DB_NAME='cuoikyweb'
```
🚀 4. Chạy dự án
```
cd frontend
npm run dev
cd ../backend
node server.js
```

👨‍💻 Tác giả
Đồng Nguyễn Duy Toàn
GitHub: @duytoan11123
