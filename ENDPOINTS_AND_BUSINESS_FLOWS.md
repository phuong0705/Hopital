# Thống kê endpoint và luồng nghiệp vụ

Tài liệu này được tổng hợp từ `app.js`, thư mục `routes/` và `config/business-processes.js`.

## Tổng quan

- Endpoint handler định nghĩa trong code: `211`
- Middleware/mount route bằng `app.use/router.use`: `47`
- Luồng nghiệp vụ chính trong `config/business-processes.js`: `10`
- Chức năng/nghiệp vụ con trong các luồng: `41`

Lưu ý:

- Số `211` là số route handler `GET/POST/PUT/PATCH/DELETE/ALL` được định nghĩa trong source.
- Một số router được mount nhiều prefix, ví dụ `shift-assignments.routes.js` được dùng cho API thường, API admin và API manager.
- `auth.routes.js` cũng được mount trong `routes/index.js`, trong khi `app.js` có khai báo trực tiếp các route auth tương tự.
- Nếu tính theo URL thực tế sau khi mount và tính cả alias, số endpoint truy cập được khoảng `222`.

## Endpoint hệ thống và xác thực

Nguồn: `app.js`

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/api/health` | Health check API |
| GET | `/health` | Health check web/app |
| GET | `/login` | Hiển thị đăng nhập |
| POST | `/login` | Xử lý đăng nhập |
| GET | `/register` | Hiển thị đăng ký |
| POST | `/register` | Xử lý đăng ký |
| GET | `/forgot-password` | Hiển thị quên mật khẩu |
| POST | `/forgot-password` | Xử lý đặt lại mật khẩu |
| POST | `/logout` | Đăng xuất |

Nguồn: `routes/auth.routes.js` mount tại `/`

| Method | Path |
|---|---|
| GET | `/login` |
| POST | `/login` |
| GET | `/register` |
| POST | `/register` |
| GET | `/forgot-password` |
| POST | `/forgot-password` |
| POST | `/logout` |

## Endpoint gốc và API chung

Nguồn: `routes/index.js`

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/` | Landing hoặc redirect theo session |
| GET | `/api/my-shifts` | API phân ca cá nhân dùng chung |
| GET | `/api/doctor/my-shifts` | API lịch trực bác sĩ |
| GET | `/api/nurse/my-shifts` | API lịch trực điều dưỡng |
| GET | `/api/staff/my-shifts` | API lịch làm việc nhân viên |
| GET | `/api/dashboard/summary` | API dashboard tổng quan |
| GET | `/api/dashboard/doctor` | API dashboard bác sĩ |
| GET | `/reports` | Redirect/proxy báo cáo |
| GET | `/doctor/phan-ca-cua-toi` | Trang phân ca bác sĩ |
| GET | `/doctor/my-shifts` | Alias trang phân ca bác sĩ |
| GET | `/nurse/phan-ca-cua-toi` | Trang phân ca điều dưỡng |
| GET | `/nurse/my-shifts` | Alias trang phân ca điều dưỡng |
| GET | `/staff/phan-ca-cua-toi` | Trang phân ca nhân viên |
| GET | `/staff/my-shifts` | Alias trang phân ca nhân viên |

## Dashboard

Nguồn: `routes/dashboard.routes.js` mount tại `/dashboard`

| Method | Path |
|---|---|
| GET | `/dashboard/home` |
| GET | `/dashboard/nurse` |
| GET | `/dashboard/pharmacy` |
| GET | `/dashboard/` |

## Admin

Nguồn: `routes/admin.routes.js` mount tại `/admin`

| Method | Path |
|---|---|
| GET | `/admin/roles-permissions` |
| POST | `/admin/roles-permissions/modules` |
| GET | `/admin/phan-ca` |
| GET | `/admin/shift-assignments` |
| GET | `/admin/phan-ca/new` |
| GET | `/admin/phan-ca/edit` |
| POST | `/admin/phan-ca/batch` |
| POST | `/admin/phan-ca/batch-update` |
| POST | `/admin/phan-ca` |
| POST | `/admin/phan-ca/:id/update` |
| POST | `/admin/phan-ca/:id/delete` |
| POST | `/admin/phan-ca/:id/status` |
| POST | `/admin/roles` |
| POST | `/admin/roles/:id/update` |
| POST | `/admin/roles/:id/delete` |
| GET | `/admin/modules` |
| GET | `/admin/staff` |
| GET | `/admin/integrations` |
| GET | `/admin/backup-restore` |
| GET | `/admin/audit-log` |
| GET | `/admin/monitoring` |

## Manager / Trưởng khoa

Nguồn: `routes/manager.routes.js` mount tại `/manager` và `/department-manager`

| Method | Path |
|---|---|
| GET | `/manager/phan-ca` |
| GET | `/manager/shift-assignments` |
| POST | `/manager/phan-ca` |
| POST | `/manager/phan-ca/:id/update` |
| POST | `/manager/phan-ca/:id/delete` |
| POST | `/manager/phan-ca/:id/status` |
| GET | `/department-manager/phan-ca` |
| GET | `/department-manager/shift-assignments` |
| POST | `/department-manager/phan-ca` |
| POST | `/department-manager/phan-ca/:id/update` |
| POST | `/department-manager/phan-ca/:id/delete` |
| POST | `/department-manager/phan-ca/:id/status` |

## API phân ca

Nguồn: `routes/shift-assignments.routes.js`

Router này được mount ở 3 prefix:

- `/api/shift-assignments`
- `/api/admin/shift-assignments`
- `/api/manager/shift-assignments`

| Method | Path |
|---|---|
| GET | `/api/shift-assignments/` |
| GET | `/api/shift-assignments/:id` |
| POST | `/api/shift-assignments/` |
| PUT | `/api/shift-assignments/:id` |
| DELETE | `/api/shift-assignments/:id` |
| PATCH | `/api/shift-assignments/:id/status` |
| GET | `/api/admin/shift-assignments/` |
| GET | `/api/admin/shift-assignments/:id` |
| POST | `/api/admin/shift-assignments/` |
| PUT | `/api/admin/shift-assignments/:id` |
| DELETE | `/api/admin/shift-assignments/:id` |
| PATCH | `/api/admin/shift-assignments/:id/status` |
| GET | `/api/manager/shift-assignments/` |
| GET | `/api/manager/shift-assignments/:id` |
| POST | `/api/manager/shift-assignments/` |
| PUT | `/api/manager/shift-assignments/:id` |
| DELETE | `/api/manager/shift-assignments/:id` |
| PATCH | `/api/manager/shift-assignments/:id/status` |

## API báo cáo

Nguồn: `routes/reports-api.routes.js` mount tại `/api/reports`

| Method | Path |
|---|---|
| GET | `/api/reports/summary` |

## Bệnh nhân

Nguồn: `routes/patients.routes.js` mount tại `/patients`

| Method | Path |
|---|---|
| GET | `/patients/reception` |
| POST | `/patients/reception` |
| GET | `/patients/me` |
| GET | `/patients/me/treatments` |
| GET | `/patients/me/medicines` |
| GET | `/patients/me/labtests` |
| GET | `/patients/me/billing` |
| GET | `/patients/me/discharge` |
| GET | `/patients/me/support` |
| GET | `/patients/me/bhyt` |
| GET | `/patients/me/booking` |
| POST | `/patients/me/booking` |
| GET | `/patients/me/notifications` |
| POST | `/patients/me/support` |
| GET | `/patients/` |
| GET | `/patients/list` |
| POST | `/patients/:admissionId/status` |
| GET | `/patients/:id` |

## Hồ sơ bệnh án

Nguồn: `routes/medicalRecords.routes.js` mount tại `/medical-records`

| Method | Path |
|---|---|
| GET | `/medical-records/` |
| POST | `/medical-records/:id/complete` |
| GET | `/medical-records/:id` |

## Khoa/phòng

Nguồn: `routes/departments.routes.js` mount tại `/departments`

| Method | Path |
|---|---|
| GET | `/departments/` |
| POST | `/departments/` |
| POST | `/departments/:id/update` |
| POST | `/departments/:id/delete` |
| GET | `/departments/:id` |
| POST | `/departments/rooms` |
| POST | `/departments/rooms/:id` |
| POST | `/departments/rooms/:id/delete` |
| POST | `/departments/beds` |
| POST | `/departments/beds/:id` |
| POST | `/departments/beds/:id/delete` |

## Giường/phòng

Nguồn: `routes/beds.routes.js` mount tại `/beds`

| Method | Path |
|---|---|
| GET | `/beds/` |
| GET | `/beds/rooms/:id` |
| POST | `/beds/rooms/:id/status` |
| POST | `/beds/transfer` |

## Bác sĩ

Nguồn: `routes/doctors.routes.js` mount tại `/doctors`

| Method | Path |
|---|---|
| GET | `/doctors/` |
| POST | `/doctors/` |
| POST | `/doctors/:id/update` |
| POST | `/doctors/:id/delete` |

## Điều dưỡng

Nguồn: `routes/nursing.routes.js` mount tại `/nursing`

| Method | Path |
|---|---|
| GET | `/nursing/` |

## Điều trị

Nguồn: `routes/treatments.routes.js` mount tại `/treatments`

| Method | Path |
|---|---|
| GET | `/treatments/` |
| POST | `/treatments/:id/status` |

## Đơn thuốc

Nguồn: `routes/prescriptions.routes.js` mount tại `/prescriptions`

| Method | Path |
|---|---|
| GET | `/prescriptions/` |
| POST | `/prescriptions/` |
| GET | `/prescriptions/:id/in-bieu-mau-noi-tru` |

## Xét nghiệm

Nguồn: `routes/labtests.routes.js` mount tại `/labtests`

| Method | Path |
|---|---|
| GET | `/labtests/` |
| POST | `/labtests/` |
| POST | `/labtests/:testCode/result` |
| POST | `/labtests/:testCode/confirm-cost` |

## Viện phí

Nguồn: `routes/billing.routes.js` mount tại `/billing`

| Method | Path |
|---|---|
| GET | `/billing/` |
| POST | `/billing/` |
| GET | `/billing/receipts/:id/print` |
| POST | `/billing/admissions/:admissionId/notify` |
| POST | `/billing/admissions/:admissionId/confirm-discharge` |

## BHYT

Nguồn: `routes/bhyt.routes.js` mount tại `/bhyt`

| Method | Path |
|---|---|
| GET | `/bhyt/` |

## Xuất viện

Nguồn: `routes/discharges.routes.js` mount tại `/discharges`

| Method | Path |
|---|---|
| GET | `/discharges/` |
| POST | `/discharges/` |

## Người dùng

Nguồn: `routes/users.routes.js` mount tại `/users`

| Method | Path |
|---|---|
| GET | `/users/` |
| POST | `/users/` |
| POST | `/users/:id/update` |
| POST | `/users/:id/delete` |

## Cài đặt

Nguồn: `routes/settings.routes.js` mount tại `/settings`

| Method | Path |
|---|---|
| GET | `/settings/` |

## Thu ngân

Nguồn: `routes/cashier.routes.js` mount tại `/thu-ngan`

| Method | Path |
|---|---|
| GET | `/thu-ngan/dat-lich-hen-kham` |
| POST | `/thu-ngan/dat-lich-hen-kham` |
| POST | `/thu-ngan/dat-lich-hen-kham/:id/status` |
| GET | `/thu-ngan/hang-cho` |
| GET | `/thu-ngan/in-phieu-hoa-don` |
| GET | `/thu-ngan/hoan-tien-dieu-chinh` |
| GET | `/thu-ngan/bao-cao-ca` |

## Nghiệp vụ

Nguồn: `routes/business.routes.js` mount tại `/nghiep-vu`

| Method | Path |
|---|---|
| GET | `/nghiep-vu/danh-muc-benh` |
| POST | `/nghiep-vu/danh-muc-benh` |
| POST | `/nghiep-vu/danh-muc-benh/:id/update` |
| POST | `/nghiep-vu/danh-muc-benh/:id/status` |
| GET | `/nghiep-vu/danh-muc-thuoc` |
| GET | `/nghiep-vu/tim-thuoc` |
| POST | `/nghiep-vu/danh-muc-thuoc` |
| POST | `/nghiep-vu/danh-muc-thuoc/:id/update` |
| POST | `/nghiep-vu/danh-muc-thuoc/:id/status` |
| GET | `/nghiep-vu/danh-muc-dich-vu` |
| POST | `/nghiep-vu/danh-muc-dich-vu` |
| POST | `/nghiep-vu/danh-muc-dich-vu/:id/update` |
| POST | `/nghiep-vu/danh-muc-dich-vu/:id/status` |
| GET | `/nghiep-vu/bieu-mau` |
| POST | `/nghiep-vu/bieu-mau` |
| POST | `/nghiep-vu/bieu-mau/:id/status` |
| GET | `/nghiep-vu/bieu-mau/don-thuoc-noi-tru` |
| GET | `/nghiep-vu/lap-phieu-kham` |
| POST | `/nghiep-vu/lap-phieu-kham` |
| GET | `/nghiep-vu/chan-benh` |
| GET | `/nghiep-vu/chi-dinh-cdha-thu-thuat` |
| GET | `/nghiep-vu/tra-cuu-du-lieu-kham` |
| GET | `/nghiep-vu/theo-doi-ket-qua-kham` |
| GET | `/nghiep-vu/theo-doi-thoi-gian-nam` |
| GET | `/nghiep-vu/lap-phac-do` |
| GET | `/nghiep-vu/lich-mo-thu-thuat` |
| GET | `/nghiep-vu/tong-hop-ket-qua-xet-nghiem` |
| GET | `/nghiep-vu/tiep-nhan-kham-benh` |
| GET | `/nghiep-vu/tai-kham` |
| GET | `/nghiep-vu/lich-hen-kham-hom-nay` |
| POST | `/nghiep-vu/lich-hen-kham-hom-nay/:id/status` |
| GET | `/nghiep-vu/phieu-kham-cho` |
| GET | `/nghiep-vu/quan-ly-dieu-duong` |
| POST | `/nghiep-vu/quan-ly-dieu-duong/phan-cong` |
| POST | `/nghiep-vu/quan-ly-dieu-duong/:id/ngung-phu-trach` |
| GET | `/nghiep-vu/xu-tri-sau-kham` |
| POST | `/nghiep-vu/xu-tri-sau-kham/nhap-vien` |
| POST | `/nghiep-vu/xu-tri-sau-kham/ke-don` |
| POST | `/nghiep-vu/xu-tri-sau-kham/ra-vien` |
| POST | `/nghiep-vu/xu-tri-sau-kham/chuyen-vien` |
| GET | `/nghiep-vu/theo-doi-sinh-hieu` |
| POST | `/nghiep-vu/theo-doi-sinh-hieu` |
| GET | `/nghiep-vu/ghi-chu-dieu-duong` |
| POST | `/nghiep-vu/ghi-chu-dieu-duong` |
| GET | `/nghiep-vu/cap-nhat-trang-thai-phong` |
| POST | `/nghiep-vu/cap-nhat-trang-thai-phong/:id/status` |
| GET | `/nghiep-vu/quan-ly-thuoc-tai-khoa` |
| GET | `/nghiep-vu/quan-ly-thuoc-tai-khoa/:id/history` |
| POST | `/nghiep-vu/quan-ly-thuoc-tai-khoa/chi-phi-thuoc/:costId/xac-nhan` |
| POST | `/nghiep-vu/quan-ly-thuoc-tai-khoa/transaction` |
| POST | `/nghiep-vu/quan-ly-thuoc-tai-khoa/provision` |
| GET | `/nghiep-vu/vat-tu-tieu-hao` |
| GET | `/nghiep-vu/vat-tu-tieu-hao/:id/history` |
| POST | `/nghiep-vu/vat-tu-tieu-hao/transaction` |
| GET | `/nghiep-vu/tinh-phi-kham` |
| GET | `/nghiep-vu/hoa-don` |
| GET | `/nghiep-vu/hoa-don/in-bieu-mau` |
| GET | `/nghiep-vu/quan-ly-bac-si-truc` |
| POST | `/nghiep-vu/quan-ly-bac-si-truc/new` |
| POST | `/nghiep-vu/quan-ly-bac-si-truc/:id` |
| POST | `/nghiep-vu/quan-ly-bac-si-truc/:id/delete` |
| GET | `/nghiep-vu/phan-ca` |
| GET | `/nghiep-vu/quan-ly-ca-truc` |
| GET | `/nghiep-vu/theo-doi-hieu-suat` |
| GET | `/nghiep-vu/thong-ke-benh-nhan-noi-tru` |
| GET | `/nghiep-vu/thong-ke-doanh-thu` |
| GET | `/nghiep-vu/thong-ke-luot-kham` |
| GET | `/nghiep-vu/thong-ke-su-dung-thuoc` |
| GET | `/nghiep-vu/bao-cao-xuat-vien` |
| GET | `/nghiep-vu/sao-luu-du-lieu` |
| POST | `/nghiep-vu/sao-luu-du-lieu` |
| GET | `/nghiep-vu/phuc-hoi-du-lieu` |
| GET | `/nghiep-vu/:slug` |

## Luồng nghiệp vụ

Nguồn: `config/business-processes.js`

### 1. Quản lý danh mục

Roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

| Mã | Chức năng | Route |
|---|---|---|
| 1.1 | Danh mục khoa/phòng | `/departments` |
| 1.2 | Danh mục bác sĩ | `/doctors` |
| 1.3 | Danh mục bệnh | `/nghiep-vu/danh-muc-benh` |
| 1.4 | Danh mục thuốc | `/nghiep-vu/danh-muc-thuoc` |
| 1.5 | Danh mục dịch vụ | `/nghiep-vu/danh-muc-dich-vu` |
| 1.6 | Danh mục phòng bệnh | `/beds` |

### 2. Quản lý bệnh nhân

Roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

| Mã | Chức năng | Route |
|---|---|---|
| 2.1 | Tiếp nhận bệnh nhân | `/patients/reception` |
| 2.2 | Quản lý HSBA | `/medical-records` |
| 2.3 | Quản lý thông tin cá nhân | `/patients/list` |
| 2.4 | Kê đơn thuốc | `/prescriptions` |
| 2.5 | Quản lý BHYT | `/bhyt` |

### 3. Quản lý khám bệnh

Roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

| Mã | Chức năng | Route |
|---|---|---|
| 3.1 | Lập phiếu khám | `/nghiep-vu/lap-phieu-kham` |
| 3.2 | Lịch hẹn hôm nay | `/nghiep-vu/lich-hen-kham-hom-nay` |
| 3.3 | Chẩn bệnh | `/nghiep-vu/chan-benh` |
| 3.4 | Chỉ định xét nghiệm | `/labtests` |
| 3.5 | Tra cứu dữ liệu | `/nghiep-vu/tra-cuu-du-lieu-kham` |
| 3.6 | Theo dõi kết quả khám | `/nghiep-vu/theo-doi-ket-qua-kham` |

### 4. Quản lý nội trú

Roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

| Mã | Chức năng | Route |
|---|---|---|
| 4.1 | Nhập viện | `/patients/reception` |
| 4.2 | Phân giường/phòng | `/beds` |
| 4.3 | Theo dõi thời gian nằm | `/nghiep-vu/theo-doi-thoi-gian-nam` |
| 4.4 | Xuất viện | `/discharges` |

### 5. Quản lý điều trị

Roles: `ADMIN`, `DOCTOR`, `NURSE`

| Mã | Chức năng | Route |
|---|---|---|
| 5.1 | Lập phác đồ | `/nghiep-vu/lap-phac-do` |
| 5.2 | Kê đơn thuốc | `/prescriptions` |
| 5.3 | Theo dõi diễn biến | `/treatments` |
| 5.4 | Tổng hợp kết quả xét nghiệm | `/nghiep-vu/tong-hop-ket-qua-xet-nghiem` |

### 6. Quản lý viện phí

Roles: `ADMIN`, `RECEPTIONIST`, `NURSE`

| Mã | Chức năng | Route |
|---|---|---|
| 6.1 | Tính phí khám | `/nghiep-vu/tinh-phi-kham` |
| 6.2 | Thu phí nội trú | `/billing` |
| 6.3 | Hóa đơn | `/nghiep-vu/hoa-don` |
| 6.4 | Trạng thái xét nghiệm | `/labtests` |

### 7. Quản lý nhân sự

Roles: `ADMIN`

| Mã | Chức năng | Route |
|---|---|---|
| 7.1 | Quản lý tài khoản nhân viên | `/users` |
| 7.2 | Phân công bác sĩ trực | `/nghiep-vu/quan-ly-bac-si-truc` |
| 7.3 | Quản lý ca trực | `/nghiep-vu/quan-ly-ca-truc` |
| 7.4 | Theo dõi hiệu suất | `/nghiep-vu/theo-doi-hieu-suat` |
| 7.5 | Phân ca | `/nghiep-vu/phan-ca` |

### 8. Dược & kho

Roles: `PHARMACY`

| Mã | Chức năng | Route |
|---|---|---|
| D.1 | Danh mục thuốc | `/nghiep-vu/danh-muc-thuoc` |
| D.2 | Tồn kho & cấp phát thuốc | `/nghiep-vu/quan-ly-thuoc-tai-khoa` |
| D.3 | Vật tư tiêu hao | `/nghiep-vu/vat-tu-tieu-hao` |
| D.4 | Báo cáo sử dụng thuốc | `/nghiep-vu/thong-ke-su-dung-thuoc` |

### 9. Báo cáo - thống kê

Roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`

| Mã | Chức năng | Route |
|---|---|---|
| 8.1 | Báo cáo thống kê | `/reports` |

### 10. Quản trị hệ thống

Roles: `ADMIN`

| Mã | Chức năng | Route |
|---|---|---|
| 9.1 | Sao lưu dữ liệu | `/nghiep-vu/sao-luu-du-lieu` |
| 9.2 | Phục hồi dữ liệu | `/nghiep-vu/phuc-hoi-du-lieu` |
