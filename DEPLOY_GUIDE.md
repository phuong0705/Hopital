# Huong dan deploy he thong quan ly kham chua benh noi tru

## 1. Deploy database Azure SQL

Tao Azure SQL Database va lay cac thong tin:

- DB_USER
- DB_PASSWORD
- DB_SERVER
- DB_NAME
- DB_PORT=1433

Bat firewall/networking de backend Render co the ket noi Azure SQL. Voi Azure SQL, dung `DB_ENCRYPT=true` va `DB_TRUST_SERVER_CERTIFICATE=false`.

Chay cac file SQL migration sau khi tao schema:

```bash
npm run db:migrate:indexes
```

## 2. Deploy backend len Render

Backend Express nam o thu muc goc project.

Render Web Service:

- Root Directory: `.`
- Build Command: `npm install`
- Start Command: `npm start`

Environment Variables:

```env
NODE_ENV=production
CLIENT_URL=https://ten-frontend.vercel.app
SESSION_SECRET=...
REPORTS_FRONTEND_URL=https://ten-frontend.vercel.app/reports
REPORTS_FRONTEND_INTERNAL_URL=https://ten-frontend.vercel.app
DB_USER=...
DB_PASSWORD=...
DB_SERVER=...
DB_NAME=...
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false
```

Test:

```txt
https://hopital-yo0m.onrender.com/
https://hopital-yo0m.onrender.com/api/health
```

## 3. Deploy frontend len Vercel

Frontend React/Next.js nam trong `frontend`.

Vercel Project:

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: de mac dinh cua Next.js

Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://hopital-yo0m.onrender.com
REPORTS_API_BASE_URL=https://hopital-yo0m.onrender.com
NEXT_PUBLIC_HIS_URL=https://hopital-yo0m.onrender.com
```

## 4. Sau khi deploy

Cap nhat `CLIENT_URL`, `REPORTS_FRONTEND_URL` va `REPORTS_FRONTEND_INTERNAL_URL` ben Render bang link frontend Vercel.

Luu y production:

- Link public landing page nen la backend HIS: `https://hopital-yo0m.onrender.com`.
- Frontend Next chi dung cho module bao cao. Route `/` cua frontend se redirect ve `NEXT_PUBLIC_HIS_URL`.
- Neu `NEXT_PUBLIC_HIS_URL` bi thieu hoac tro nham `/reports`, mo domain frontend co the vao thang bao cao va bi dua ve dang nhap.

Redeploy backend.

## 5. Test chuc nang

- Dang nhap
- Danh sach benh nhan
- Ho so noi tru
- Chi dinh
- Ke don
- Thanh toan
- Bao cao thong ke

Luu y: khong push file `.env` chua mat khau that.
