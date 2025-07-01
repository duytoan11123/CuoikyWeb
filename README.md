
## 📥 1. Clone dự án

```bash
git clone https://github.com/duytoan11123/CuoikyWeb.git
cd CuoikyWeb
📦 2. Cài đặt thư viện
Frontend:
bash
Sao chép
Chỉnh sửa
cd frontend
npm install
Backend:
bash
Sao chép
Chỉnh sửa
cd ../backend
npm install
🗄️ 3. Import cơ sở dữ liệu
Bước 1: Tạo database (nếu chưa có)
sql
Sao chép
Chỉnh sửa
CREATE DATABASE booking_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
Bước 2: Import từ file SQL
bash
Sao chép
Chỉnh sửa
cd backend
mysql -u root -p booking_app < ./database/init.sql
🔐 Thay root và booking_app nếu bạn dùng user hoặc tên DB khác.

⚙️ 4. Tạo file cấu hình .env
Tạo file .env trong thư mục backend:

bash
Sao chép
Chỉnh sửa
cp .env.example .env
Nội dung mẫu .env.example:
env
Sao chép
Chỉnh sửa
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=booking_app
🚀 5. Chạy dự án
Frontend:
bash
Sao chép
Chỉnh sửa
cd frontend
npm run dev
Backend:
bash
Sao chép
Chỉnh sửa
cd ../backend
node server.js
✅ Kiểm tra
Frontend: http://localhost:3000

Backend API: http://localhost:5000/api

👨‍💻 Tác giả
Đồng Nguyễn Duy Toàn
GitHub: @duytoan11123
