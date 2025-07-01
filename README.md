
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
PORT=4000
GOOGLE_CLIENT_ID=150280757509-i2av5mkmagn5u8a1ahrf9d52bot0qjl5.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
SESSION_SECRET=your-super-secret-key-123456789
UNSPLASH_ACCESS_KEY = 83GIB2x9Kc8x5vpJdsr4jxtu41b6broj09YEBALrAEU
GEMINI_API_KEY=AIzaSyAA19o_YJw_aOfJvzzoEq5y16yu9ugBF2Q



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
