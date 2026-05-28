# He thong quan li kham chua benh noi tru

Project MVC dung Node.js, Express.js, EJS, Bootstrap 5 va SQL Server. Khong dung Docker.

## Cau truc project

```text
.
├── app.js
├── package.json
├── .env.example
├── config/db.js
├── controllers
├── middlewares
├── repositories
├── routes
├── services
├── sql/schema-and-seed.sql
├── views
└── public
```

## Chay local

1. Cai dependencies:

```bash
npm install
```

2. Tao database va seed du lieu bang SQL Server Management Studio hoac Azure Data Studio:

```sql
-- Mo va chay toan bo file:
-- sql/schema-and-seed.sql
```

3. Tao file `.env` tu `.env.example`. Project dung driver `mssql` va SQL Server Authentication:

```env
PORT=3003
NODE_ENV=development
DB_SERVER=localhost
DB_NAME=QuanLyKhamChuaBenhNoiTru
DB_USER=sa
DB_PASSWORD=mat_khau_sql_server
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
SESSION_SECRET=doi_chuoi_bi_mat_that_manh
```

Neu dung SQL Server Express, doi server thanh:

```env
DB_SERVER=localhost\SQLEXPRESS
```

4. Chay ung dung:

```bash
npm run dev
```

Hoac neu PowerShell chan script npm:

```bash
cmd /c npm run dev
```

5. Mo trinh duyet:

```text
http://localhost:3003
```

## Tai khoan mau

| Role | Username | Password |
| --- | --- | --- |
| Admin | admin | 123456 |
| Bac si | bacsi | 123456 |
| Y ta / dieu duong | dieuduong | 123456 |
| Tiep nhan / thu ngan | thungan | 123456 |
| Duoc | duoc | 123456 |
| Benh nhan | benhnhan | 123456 |

Mat khau seed de dang don gian nham de kiem thu local. Khi dung thuc te, can chuyen toan bo `password_hash` sang bcrypt.

Neu database da tao tu truoc, chay them migration:

```sql
-- sql/migrations/add-patient-role.sql
```
