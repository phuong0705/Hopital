# PROMPT_DEPLOY.md

Bạn là Codex. Hãy đọc toàn bộ project hiện tại và cấu hình deploy cho hệ thống:

- Frontend: React
- Backend: Node.js + Express.js
- Database: SQL Server / Azure SQL Database
- Deploy frontend: Vercel
- Deploy backend: Render
- Database: Azure SQL Database

Mục tiêu: chỉnh project để có thể push GitHub rồi deploy được ngay.

---

## 1. Kiểm tra cấu trúc project

Hãy kiểm tra project có dạng nào trong các dạng sau:

### Dạng A: tách frontend/backend

```txt
project/
├── client/
└── server/
```

### Dạng B: tất cả nằm chung một thư mục

```txt
project/
├── src/
├── server/
├── package.json
```

Nếu chưa rõ, hãy tự xác định thư mục React và thư mục Express bằng cách đọc `package.json`.

Không được xóa code nghiệp vụ hiện có.

---

## 2. Việc cần làm cho backend Express

Tìm thư mục backend Express. Thường là:

```txt
server/
backend/
api/
```

Trong backend, hãy đảm bảo có các package sau:

```bash
npm install express cors dotenv mssql
```

Nếu project đã có package rồi thì không cài trùng.

---

## 3. Tạo hoặc sửa file kết nối SQL Server

Tạo file:

```txt
server/config/db.js
```

Nếu project đã có file kết nối database khác, hãy sửa file hiện có thay vì tạo trùng.

Nội dung chuẩn cần dùng:

```js
const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Ket noi SQL Server thanh cong");
    return pool;
  })
  .catch((err) => {
    console.error("Loi ket noi SQL Server:", err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise
};
```

Nếu backend đang dùng ES Module `"type": "module"` thì chuyển code trên sang dạng:

```js
import sql from "mssql";

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Ket noi SQL Server thanh cong");
    return pool;
  })
  .catch((err) => {
    console.error("Loi ket noi SQL Server:", err);
    throw err;
  });

export { sql, poolPromise };
```

---

## 4. Sửa file chạy chính của backend

Tìm file chính của backend, ví dụ:

```txt
server/index.js
server/server.js
server/app.js
```

Đảm bảo file đó có:

```js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API quan ly kham chua benh noi tru dang chay");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend dang hoat dong"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server dang chay o port ${PORT}`);
});
```

Nếu file chính đã có route nghiệp vụ, không được xóa route cũ. Chỉ thêm route `/` và `/api/health` nếu chưa có.

Nếu project dùng ES Module thì dùng `import` thay cho `require`.

---

## 5. Sửa CORS cho frontend deploy Vercel

Nếu backend đang có:

```js
app.use(cors());
```

Hãy đổi thành:

```js
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));
```

Nếu project có nhiều domain frontend, hỗ trợ thêm dạng danh sách:

```js
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
```

---

## 6. Sửa package.json backend cho Render

Trong `server/package.json`, đảm bảo có:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

Nếu file chính là `server.js`, dùng:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

Nếu file chính là `app.js`, dùng:

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  }
}
```

Không được làm hỏng các script khác đang có.

---

## 7. Tạo file `.env.example` cho backend

Tạo file:

```txt
server/.env.example
```

Nội dung:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

DB_USER=your_sql_server_user
DB_PASSWORD=your_sql_server_password
DB_SERVER=your-server.database.windows.net
DB_NAME=your_database_name
DB_PORT=1433
```

Không tạo file `.env` chứa mật khẩu thật.

---

## 8. Tạo file `render.yaml`

Ở thư mục gốc project, tạo file:

```txt
render.yaml
```

Nếu backend nằm trong `server/`, dùng:

```yaml
services:
  - type: web
    name: ql-noi-tru-api
    runtime: node
    rootDir: server
    buildCommand: npm install
    startCommand: npm start
    plan: free
    envVars:
      - key: NODE_ENV
        value: production
      - key: CLIENT_URL
        sync: false
      - key: DB_USER
        sync: false
      - key: DB_PASSWORD
        sync: false
      - key: DB_SERVER
        sync: false
      - key: DB_NAME
        sync: false
      - key: DB_PORT
        value: 1433
```

Nếu backend không nằm trong `server/`, sửa `rootDir` cho đúng.

---

## 9. Việc cần làm cho React frontend

Tìm thư mục React. Thường là:

```txt
client/
frontend/
```

Kiểm tra React dùng Vite hay Create React App.

Nếu có `vite.config.js` hoặc dependency `vite`, đó là Vite.

Tạo file:

```txt
client/.env.example
```

Nếu là Vite:

```env
VITE_API_URL=http://localhost:5000
```

Nếu là Create React App:

```env
REACT_APP_API_URL=http://localhost:5000
```

Không tạo `.env` chứa link thật nếu chưa biết link backend.

---

## 10. Sửa code gọi API trong React

Tìm các đoạn gọi API kiểu hard-code:

```js
fetch("http://localhost:5000/api/...")
axios.get("http://localhost:5000/api/...")
```

Đổi thành dùng biến môi trường.

Nếu là Vite:

```js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

Ví dụ:

```js
fetch(`${API_URL}/api/benhnhan`);
```

Nếu là Create React App:

```js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
```

Ví dụ:

```js
fetch(`${API_URL}/api/benhnhan`);
```

Ưu tiên tạo file dùng chung:

```txt
client/src/config/api.js
```

Với Vite:

```js
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

Với Create React App:

```js
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
```

Sau đó sửa các file React import `API_URL` từ file này.

---

## 11. Tạo file `vercel.json` nếu cần

Nếu React dùng Vite hoặc CRA và cần fix lỗi refresh trang 404, tạo file trong thư mục frontend:

```txt
client/vercel.json
```

Nội dung:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Nếu project không dùng React Router thì file này vẫn an toàn.

---

## 12. Tạo `.gitignore`

Ở thư mục gốc, tạo hoặc sửa `.gitignore`:

```gitignore
node_modules
.env
.env.local
.env.production
dist
build
.DS_Store
npm-debug.log
yarn-error.log
```

Không xóa các ignore cũ.

---

## 13. Tạo file hướng dẫn deploy

Tạo file:

```txt
DEPLOY_GUIDE.md
```

Nội dung cần có:

```md
# Hướng dẫn deploy hệ thống quản lý khám chữa bệnh nội trú

## 1. Deploy database Azure SQL

Tạo Azure SQL Database và lấy các thông tin:

- DB_USER
- DB_PASSWORD
- DB_SERVER
- DB_NAME
- DB_PORT=1433

Bật firewall/networking để backend Render có thể kết nối.

## 2. Deploy backend lên Render

Render Web Service:

- Root Directory: server
- Build Command: npm install
- Start Command: npm start

Environment Variables:

```env
NODE_ENV=production
CLIENT_URL=https://ten-frontend.vercel.app
DB_USER=...
DB_PASSWORD=...
DB_SERVER=...
DB_NAME=...
DB_PORT=1433
```

Test:

```txt
https://ten-backend.onrender.com/
https://ten-backend.onrender.com/api/health
```

## 3. Deploy frontend lên Vercel

Vercel Project:

- Root Directory: client
- Build Command: npm run build
- Output Directory:
  - Vite: dist
  - CRA: build

Environment Variables:

Nếu Vite:

```env
VITE_API_URL=https://ten-backend.onrender.com
```

Nếu CRA:

```env
REACT_APP_API_URL=https://ten-backend.onrender.com
```

## 4. Sau khi deploy

Cập nhật `CLIENT_URL` bên Render bằng link frontend Vercel.

Redeploy backend.

## 5. Test chức năng

- Đăng nhập
- Danh sách bệnh nhân
- Hồ sơ nội trú
- Chỉ định
- Kê đơn
- Thanh toán
```

---

## 14. Kiểm tra lỗi trước khi kết thúc

Sau khi chỉnh xong, chạy các lệnh kiểm tra.

Backend:

```bash
cd server
npm install
npm start
```

Frontend:

```bash
cd client
npm install
npm run build
```

Nếu tên thư mục khác `server` hoặc `client`, dùng đúng tên thư mục thực tế.

---

## 15. Báo cáo lại sau khi làm xong

Sau khi hoàn thành, hãy trả lời theo mẫu:

```txt
Đã cấu hình deploy xong.

Các file đã thêm/sửa:
- ...
- ...
- ...

Cách deploy:
1. Push code lên GitHub
2. Render: chọn rootDir ...
3. Vercel: chọn rootDir ...
4. Thêm environment variables ...

Lưu ý:
- Không push file .env
- Cần bật firewall Azure SQL
- Cần cập nhật CLIENT_URL sau khi có link Vercel
```

---

## 16. Quy tắc quan trọng

- Không xóa code nghiệp vụ.
- Không đổi tên bảng SQL.
- Không đổi logic đăng nhập nếu không cần.
- Không hard-code mật khẩu database.
- Không commit `.env`.
- Không thay toàn bộ project nếu chỉ cần sửa deploy.
- Nếu thấy lỗi import CommonJS/ESM, sửa theo style hiện tại của project.
- Nếu có TypeScript, giữ TypeScript.
- Nếu có JavaScript, giữ JavaScript.
