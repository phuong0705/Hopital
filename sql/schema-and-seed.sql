IF DB_ID(N'QuanLyKhamChuaBenhNoiTru') IS NULL
BEGIN
  CREATE DATABASE QuanLyKhamChuaBenhNoiTru;
END
GO

USE QuanLyKhamChuaBenhNoiTru;
GO

DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Discharges;
DROP TABLE IF EXISTS BillingItems;
DROP TABLE IF EXISTS Billing;
DROP TABLE IF EXISTS LabTests;
DROP TABLE IF EXISTS PrescriptionItems;
DROP TABLE IF EXISTS Prescriptions;
DROP TABLE IF EXISTS TreatmentSchedules;
DROP TABLE IF EXISTS MedicalRecords;
DROP TABLE IF EXISTS Admissions;
DROP TABLE IF EXISTS Beds;
DROP TABLE IF EXISTS Rooms;
DROP TABLE IF EXISTS Doctors;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Patients;
DROP TABLE IF EXISTS Roles;
DROP TABLE IF EXISTS Departments;
GO

CREATE TABLE Roles (
  role_id INT IDENTITY(1,1) PRIMARY KEY,
  role_code VARCHAR(30) NOT NULL UNIQUE,
  role_name NVARCHAR(100) NOT NULL,
  description NVARCHAR(255)
);

CREATE TABLE Users (
  user_id INT IDENTITY(1,1) PRIMARY KEY,
  role_id INT NOT NULL,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash NVARCHAR(255) NOT NULL,
  full_name NVARCHAR(150) NOT NULL,
  patient_id INT NULL,
  status NVARCHAR(30) NOT NULL DEFAULT N'Hoạt động',
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at DATETIME2,
  CONSTRAINT FK_Users_Roles FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);

CREATE TABLE Departments (
  department_id INT IDENTITY(1,1) PRIMARY KEY,
  department_code VARCHAR(30) NOT NULL UNIQUE,
  department_name NVARCHAR(150) NOT NULL,
  head_doctor NVARCHAR(150),
  phone VARCHAR(30),
  location NVARCHAR(150),
  status NVARCHAR(30) NOT NULL DEFAULT N'Hoạt động'
);

CREATE TABLE Doctors (
  doctor_id INT IDENTITY(1,1) PRIMARY KEY,
  department_id INT NOT NULL,
  doctor_code VARCHAR(30) NOT NULL UNIQUE,
  full_name NVARCHAR(150) NOT NULL,
  specialty NVARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(150),
  shift_name NVARCHAR(80),
  status NVARCHAR(30) NOT NULL DEFAULT N'Đang làm việc',
  CONSTRAINT FK_Doctors_Departments FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);

CREATE TABLE Patients (
  patient_id INT IDENTITY(1,1) PRIMARY KEY,
  patient_code VARCHAR(30) NOT NULL UNIQUE,
  full_name NVARCHAR(150) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender NVARCHAR(20) NOT NULL,
  identity_number VARCHAR(30),
  phone VARCHAR(30),
  address NVARCHAR(255),
  health_insurance_no VARCHAR(50),
  emergency_contact_name NVARCHAR(150),
  emergency_contact_phone VARCHAR(30),
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

ALTER TABLE Users
ADD CONSTRAINT FK_Users_Patients FOREIGN KEY (patient_id) REFERENCES Patients(patient_id);

CREATE TABLE Rooms (
  room_id INT IDENTITY(1,1) PRIMARY KEY,
  department_id INT NOT NULL,
  room_code VARCHAR(30) NOT NULL UNIQUE,
  room_name NVARCHAR(100),
  floor_no INT,
  status NVARCHAR(30) NOT NULL DEFAULT N'Hoạt động',
  CONSTRAINT FK_Rooms_Departments FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);

CREATE TABLE Beds (
  bed_id INT IDENTITY(1,1) PRIMARY KEY,
  room_id INT NOT NULL,
  bed_code VARCHAR(30) NOT NULL UNIQUE,
  status NVARCHAR(30) NOT NULL DEFAULT N'Trống',
  note NVARCHAR(255),
  CONSTRAINT FK_Beds_Rooms FOREIGN KEY (room_id) REFERENCES Rooms(room_id)
);

CREATE TABLE Admissions (
  admission_id INT IDENTITY(1,1) PRIMARY KEY,
  patient_id INT NOT NULL,
  department_id INT NOT NULL,
  doctor_id INT NOT NULL,
  room_id INT NULL,
  bed_id INT NULL,
  admission_date DATETIME2 NOT NULL,
  initial_diagnosis NVARCHAR(500) NOT NULL,
  initial_condition NVARCHAR(500),
  status NVARCHAR(50) NOT NULL DEFAULT N'Đang điều trị',
  priority_level NVARCHAR(30) NOT NULL DEFAULT N'Trung bình',
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  CONSTRAINT FK_Admissions_Patients FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
  CONSTRAINT FK_Admissions_Departments FOREIGN KEY (department_id) REFERENCES Departments(department_id),
  CONSTRAINT FK_Admissions_Doctors FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id),
  CONSTRAINT FK_Admissions_Rooms FOREIGN KEY (room_id) REFERENCES Rooms(room_id),
  CONSTRAINT FK_Admissions_Beds FOREIGN KEY (bed_id) REFERENCES Beds(bed_id)
);

CREATE TABLE MedicalRecords (
  record_id INT IDENTITY(1,1) PRIMARY KEY,
  record_code VARCHAR(40) NOT NULL UNIQUE,
  patient_id INT NOT NULL,
  admission_id INT NOT NULL,
  diagnosis_on_admission NVARCHAR(500) NOT NULL,
  medical_history NVARCHAR(1000),
  allergies NVARCHAR(500),
  vital_signs NVARCHAR(500),
  doctor_notes NVARCHAR(1000),
  status NVARCHAR(50) NOT NULL DEFAULT N'Đang điều trị',
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at DATETIME2,
  CONSTRAINT FK_MedicalRecords_Patients FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
  CONSTRAINT FK_MedicalRecords_Admissions FOREIGN KEY (admission_id) REFERENCES Admissions(admission_id)
);

CREATE TABLE TreatmentSchedules (
  schedule_id INT IDENTITY(1,1) PRIMARY KEY,
  record_id INT NOT NULL,
  scheduled_time DATETIME2 NOT NULL,
  treatment_content NVARCHAR(500) NOT NULL,
  assignee_name NVARCHAR(150) NOT NULL,
  status NVARCHAR(50) NOT NULL DEFAULT N'Chưa thực hiện',
  note NVARCHAR(500),
  CONSTRAINT FK_TreatmentSchedules_MedicalRecords FOREIGN KEY (record_id) REFERENCES MedicalRecords(record_id)
);

CREATE TABLE Prescriptions (
  prescription_id INT IDENTITY(1,1) PRIMARY KEY,
  prescription_code VARCHAR(40) NOT NULL UNIQUE,
  record_id INT NOT NULL,
  doctor_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  note NVARCHAR(500),
  CONSTRAINT FK_Prescriptions_MedicalRecords FOREIGN KEY (record_id) REFERENCES MedicalRecords(record_id),
  CONSTRAINT FK_Prescriptions_Doctors FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
);

CREATE TABLE PrescriptionItems (
  item_id INT IDENTITY(1,1) PRIMARY KEY,
  prescription_id INT NOT NULL,
  medicine_name NVARCHAR(150) NOT NULL,
  dosage NVARCHAR(80) NOT NULL,
  frequency NVARCHAR(80) NOT NULL,
  route NVARCHAR(80) NOT NULL,
  quantity INT NOT NULL,
  unit NVARCHAR(30) NOT NULL,
  CONSTRAINT FK_PrescriptionItems_Prescriptions FOREIGN KEY (prescription_id) REFERENCES Prescriptions(prescription_id)
);

CREATE TABLE LabTests (
  lab_test_id INT IDENTITY(1,1) PRIMARY KEY,
  test_code VARCHAR(40) NOT NULL UNIQUE,
  record_id INT NOT NULL,
  doctor_id INT NOT NULL,
  test_type NVARCHAR(150) NOT NULL,
  ordered_date DATETIME2 NOT NULL,
  status NVARCHAR(50) NOT NULL DEFAULT N'Chờ kết quả',
  result_summary NVARCHAR(1000),
  result_files NVARCHAR(MAX),
  CONSTRAINT FK_LabTests_MedicalRecords FOREIGN KEY (record_id) REFERENCES MedicalRecords(record_id),
  CONSTRAINT FK_LabTests_Doctors FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
);

CREATE TABLE Billing (
  billing_id INT IDENTITY(1,1) PRIMARY KEY,
  bill_code VARCHAR(40) NOT NULL UNIQUE,
  admission_id INT NOT NULL,
  consultation_fee DECIMAL(18,2) NOT NULL DEFAULT 0,
  bed_fee DECIMAL(18,2) NOT NULL DEFAULT 0,
  medicine_fee DECIMAL(18,2) NOT NULL DEFAULT 0,
  lab_fee DECIMAL(18,2) NOT NULL DEFAULT 0,
  insurance_covered DECIMAL(18,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  payment_status NVARCHAR(50) NOT NULL DEFAULT N'Chưa thanh toán',
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  CONSTRAINT FK_Billing_Admissions FOREIGN KEY (admission_id) REFERENCES Admissions(admission_id)
);

CREATE TABLE BillingItems (
  billing_item_id INT IDENTITY(1,1) PRIMARY KEY,
  billing_id INT NOT NULL,
  item_name NVARCHAR(150) NOT NULL,
  item_type NVARCHAR(80) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(18,2) NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  CONSTRAINT FK_BillingItems_Billing FOREIGN KEY (billing_id) REFERENCES Billing(billing_id)
);

CREATE TABLE Discharges (
  discharge_id INT IDENTITY(1,1) PRIMARY KEY,
  admission_id INT NOT NULL,
  discharge_condition NVARCHAR(500) NOT NULL,
  discharge_date DATETIME2 NOT NULL,
  treatment_summary NVARCHAR(1000) NOT NULL,
  total_cost DECIMAL(18,2) NOT NULL,
  payment_status NVARCHAR(50) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  CONSTRAINT FK_Discharges_Admissions FOREIGN KEY (admission_id) REFERENCES Admissions(admission_id)
);

CREATE TABLE Notifications (
  notification_id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NULL,
  title NVARCHAR(150) NOT NULL,
  message NVARCHAR(500) NOT NULL,
  type NVARCHAR(50) NOT NULL,
  is_read BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  CONSTRAINT FK_Notifications_Users FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
GO

INSERT INTO Roles (role_code, role_name, description) VALUES
('ADMIN', N'Quản trị hệ thống', N'Toàn quyền cấu hình và quản trị dữ liệu'),
('DOCTOR', N'Bác sĩ', N'Quản lí hồ sơ điều trị, y lệnh, thuốc và xét nghiệm'),
('NURSE', N'Y tá / điều dưỡng', N'Theo dõi chăm sóc và thực hiện y lệnh'),
('RECEPTIONIST', N'Tiếp nhận / thu ngân', N'Tiếp nhận, thanh toán và xuất viện'),
('PATIENT', N'Bệnh nhân', N'Xem hồ sơ cá nhân, lịch điều trị, đơn thuốc, xét nghiệm và viện phí của chính mình');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status) VALUES
(1, 'admin', 'admin@benhvien.vn', '123456', N'Quản trị viên', N'Hoạt động'),
(2, 'bacsi', 'bacsi@benhvien.vn', '123456', N'TS.BS Nguyễn Minh Khôi', N'Hoạt động'),
(3, 'dieuduong', 'dieuduong@benhvien.vn', '123456', N'Điều dưỡng Trần Thị Mai', N'Hoạt động'),
(4, 'thungan', 'thungan@benhvien.vn', '123456', N'Nhân viên Lê Hoàng Anh', N'Hoạt động');

INSERT INTO Departments (department_code, department_name, head_doctor, phone, location) VALUES
('NOI', N'Khoa Nội tổng hợp', N'TS.BS Nguyễn Minh Khôi', '02838110001', N'Tầng 4 - Khối A'),
('TIM', N'Khoa Tim mạch', N'TS.BS Phạm Quốc Huy', '02838110002', N'Tầng 5 - Khối A'),
('HSCC', N'Khoa Hồi sức cấp cứu', N'TS.BS Võ Thanh Bình', '02838110003', N'Tầng 2 - Khối B'),
('NGOAI', N'Khoa Ngoại tổng hợp', N'TS.BS Lê Ngọc Sơn', '02838110004', N'Tầng 3 - Khối C'),
('NHI', N'Khoa Nhi', N'TS.BS Đặng Thu Hà', '02838110005', N'Tầng 6 - Khối B');

INSERT INTO Doctors (department_id, doctor_code, full_name, specialty, phone, email, shift_name) VALUES
(1, 'BS001', N'TS.BS Nguyễn Minh Khôi', N'Nội tổng hợp', '0901000001', 'khoi.nguyen@benhvien.vn', N'Ca sáng'),
(2, 'BS002', N'ThS.BS Phạm Quốc Huy', N'Tim mạch can thiệp', '0901000002', 'huy.pham@benhvien.vn', N'Ca chiều'),
(3, 'BS003', N'BS.CKII Võ Thanh Bình', N'Hồi sức cấp cứu', '0901000003', 'binh.vo@benhvien.vn', N'Ca đêm'),
(4, 'BS004', N'ThS.BS Lê Ngọc Sơn', N'Ngoại tiêu hóa', '0901000004', 'son.le@benhvien.vn', N'Ca sáng'),
(5, 'BS005', N'BS.CKII Đặng Thu Hà', N'Nhi hô hấp', '0901000005', 'ha.dang@benhvien.vn', N'Ca chiều');

INSERT INTO Rooms (department_id, room_code, room_name, floor_no) VALUES
(1, 'A401', N'Phòng Nội 401', 4), (1, 'A402', N'Phòng Nội 402', 4),
(2, 'A501', N'Phòng Tim mạch 501', 5), (2, 'A502', N'Phòng Tim mạch 502', 5),
(3, 'B201', N'Phòng HSCC 201', 2), (3, 'B202', N'Phòng HSCC 202', 2),
(4, 'C301', N'Phòng Ngoại 301', 3), (5, 'B601', N'Phòng Nhi 601', 6);

INSERT INTO Beds (room_id, bed_code, status) VALUES
(1, 'A401-01', N'Đang sử dụng'), (1, 'A401-02', N'Đang sử dụng'), (1, 'A401-03', N'Trống'), (1, 'A401-04', N'Chờ vệ sinh'),
(2, 'A402-01', N'Trống'), (2, 'A402-02', N'Đang sử dụng'), (2, 'A402-03', N'Trống'),
(3, 'A501-01', N'Đang sử dụng'), (3, 'A501-02', N'Đang sử dụng'), (3, 'A501-03', N'Trống'),
(4, 'A502-01', N'Bảo trì'), (4, 'A502-02', N'Trống'),
(5, 'B201-01', N'Đang sử dụng'), (5, 'B201-02', N'Đang sử dụng'), (5, 'B201-03', N'Đang sử dụng'),
(6, 'B202-01', N'Trống'), (6, 'B202-02', N'Chờ vệ sinh'),
(7, 'C301-01', N'Đang sử dụng'), (7, 'C301-02', N'Trống'),
(8, 'B601-01', N'Đang sử dụng'), (8, 'B601-02', N'Trống');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no, emergency_contact_name, emergency_contact_phone) VALUES
('BN240001', N'Nguyễn Văn An', '1965-04-12', N'Nam', '079065001234', '0912345678', N'Quận Bình Thạnh, TP.HCM', 'DN4010123456789', N'Nguyễn Thị Lan', '0909000001'),
('BN240002', N'Trần Thị Bích', '1978-09-20', N'Nữ', '079178009876', '0908123456', N'Quận 3, TP.HCM', 'DN4010987654321', N'Trần Minh Tâm', '0909000002'),
('BN240003', N'Lê Hoàng Nam', '1988-01-05', N'Nam', '079088007777', '0987654321', N'Thủ Đức, TP.HCM', 'DN4010456123789', N'Lê Thị Hạnh', '0909000003'),
('BN240004', N'Phạm Thu Ngọc', '2017-06-18', N'Nữ', '079217006666', '0934567890', N'Quận 7, TP.HCM', 'TE4013333333333', N'Phạm Văn Dũng', '0909000004'),
('BN240005', N'Võ Thành Long', '1959-11-02', N'Nam', '079059005555', '0977111222', N'Hóc Môn, TP.HCM', 'DN4010555555555', N'Võ Thị Hoa', '0909000005'),
('BN240006', N'Đặng Mỹ Linh', '1992-03-15', N'Nữ', '079192004444', '0966123123', N'Quận 10, TP.HCM', 'DN4010444444444', N'Đặng Thanh Tú', '0909000006');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
SELECT r.role_id, 'benhnhan', 'benhnhan@benhvien.vn', '123456', p.full_name, p.patient_id, N'Hoạt động'
FROM Roles r
CROSS JOIN Patients p
WHERE r.role_code = 'PATIENT' AND p.patient_code = 'BN240001';

INSERT INTO Admissions (patient_id, department_id, doctor_id, room_id, bed_id, admission_date, initial_diagnosis, initial_condition, status, priority_level) VALUES
(1, 1, 1, 1, 1, DATEADD(day, -5, SYSDATETIME()), N'Viêm phổi cộng đồng, tăng huyết áp', N'Sốt 38.5°C, ho đàm, khó thở nhẹ', N'Đang điều trị', N'Cao'),
(2, 2, 2, 3, 8, DATEADD(day, -4, SYSDATETIME()), N'Suy tim mất bù độ II', N'Phù chân, khó thở khi nằm', N'Theo dõi', N'Cao'),
(3, 4, 4, 7, 18, DATEADD(day, -3, SYSDATETIME()), N'Đau bụng cấp nghi viêm ruột thừa', N'Đau hố chậu phải, buồn nôn', N'Ổn định', N'Trung bình'),
(4, 5, 5, 8, 20, DATEADD(day, -2, SYSDATETIME()), N'Viêm tiểu phế quản', N'Thở nhanh, khò khè', N'Đang điều trị', N'Trung bình'),
(5, 3, 3, 5, 13, DATEADD(day, -1, SYSDATETIME()), N'Nhiễm khuẩn huyết theo dõi sốc nhiễm trùng', N'Mạch nhanh, huyết áp thấp', N'Đang điều trị', N'Nguy cấp'),
(6, 1, 1, 2, 6, SYSDATETIME(), N'Đái tháo đường type 2 mất kiểm soát', N'Mệt, đường huyết cao', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status) VALUES
('HS240001', 1, 1, N'Viêm phổi cộng đồng, tăng huyết áp', N'Tăng huyết áp 8 năm', N'Không ghi nhận', N'Mạch 96; HA 145/90; Nhiệt 38.2; SpO2 94%', N'Theo dõi hô hấp, dùng kháng sinh theo phác đồ.', N'Đang điều trị'),
('HS240002', 2, 2, N'Suy tim mất bù độ II', N'Tăng huyết áp, rối loạn lipid máu', N'Dị ứng penicillin', N'Mạch 104; HA 150/95; SpO2 95%', N'Hạn chế dịch, theo dõi cân nặng mỗi sáng.', N'Theo dõi'),
('HS240003', 3, 3, N'Đau bụng cấp nghi viêm ruột thừa', N'Chưa ghi nhận', N'Không ghi nhận', N'Mạch 88; HA 120/80; Nhiệt 37.8', N'Theo dõi ngoại khoa, đánh giá lại sau xét nghiệm.', N'Ổn định'),
('HS240004', 4, 4, N'Viêm tiểu phế quản', N'Sinh đủ tháng, chưa ghi nhận bệnh nền', N'Không ghi nhận', N'Mạch 118; Nhiệt 37.9; SpO2 96%', N'Khí dung, theo dõi nhịp thở.', N'Đang điều trị'),
('HS240005', 5, 5, N'Nhiễm khuẩn huyết theo dõi sốc nhiễm trùng', N'Đái tháo đường, bệnh thận mạn', N'Không rõ', N'Mạch 122; HA 90/60; Nhiệt 39; SpO2 93%', N'Ưu tiên HSCC, theo dõi sát dấu hiệu sinh tồn.', N'Đang điều trị'),
('HS240006', 6, 6, N'Đái tháo đường type 2 mất kiểm soát', N'ĐTĐ type 2 5 năm', N'Không ghi nhận', N'Mạch 84; HA 125/80; ĐH 18 mmol/L', N'Điều chỉnh insulin, tư vấn dinh dưỡng.', N'Đang điều trị');

INSERT INTO TreatmentSchedules (record_id, scheduled_time, treatment_content, assignee_name, status, note) VALUES
(1, DATEADD(hour, 8, CAST(CAST(GETDATE() AS date) AS datetime2)), N'Truyền kháng sinh Ceftriaxone 2g', N'Điều dưỡng Trần Thị Mai', N'Hoàn thành', N'Không phản ứng thuốc'),
(1, DATEADD(hour, 14, CAST(CAST(GETDATE() AS date) AS datetime2)), N'Đo SpO2 và khí dung nếu khó thở', N'Điều dưỡng Trần Thị Mai', N'Chưa thực hiện', N''),
(2, DATEADD(hour, 9, CAST(CAST(GETDATE() AS date) AS datetime2)), N'Theo dõi cân nặng, lượng nước tiểu', N'Điều dưỡng Nguyễn Hồng', N'Đang thực hiện', N''),
(5, DATEADD(hour, 10, CAST(CAST(GETDATE() AS date) AS datetime2)), N'Đánh giá huyết động mỗi 30 phút', N'Điều dưỡng Lê Quốc', N'Đang thực hiện', N'Báo bác sĩ khi HA tụt'),
(6, DATEADD(hour, 11, CAST(CAST(GETDATE() AS date) AS datetime2)), N'Tiêm insulin theo phác đồ trượt', N'Điều dưỡng Trần Thị Mai', N'Chưa thực hiện', N'Kiểm tra đường huyết trước tiêm');

INSERT INTO Prescriptions (prescription_code, record_id, doctor_id, start_date, end_date, note) VALUES
('DT240001', 1, 1, CAST(DATEADD(day, -5, GETDATE()) AS date), CAST(DATEADD(day, 2, GETDATE()) AS date), N'Theo dõi dị ứng thuốc'),
('DT240002', 2, 2, CAST(DATEADD(day, -4, GETDATE()) AS date), CAST(DATEADD(day, 3, GETDATE()) AS date), N'Hạn chế dịch'),
('DT240003', 5, 3, CAST(DATEADD(day, -1, GETDATE()) AS date), CAST(DATEADD(day, 5, GETDATE()) AS date), N'Ưu tiên HSCC'),
('DT240004', 6, 1, CAST(GETDATE() AS date), CAST(DATEADD(day, 7, GETDATE()) AS date), N'Kiểm tra đường huyết');

INSERT INTO PrescriptionItems (prescription_id, medicine_name, dosage, frequency, route, quantity, unit) VALUES
(1, N'Ceftriaxone', N'2g', N'1 lần/ngày', N'Tĩnh mạch', 7, N'Lọ'),
(1, N'Paracetamol', N'500mg', N'Khi sốt trên 38.5°C', N'Uống', 10, N'Viên'),
(2, N'Furosemide', N'40mg', N'1 lần/ngày', N'Tĩnh mạch', 5, N'Ống'),
(2, N'Bisoprolol', N'2.5mg', N'1 lần/ngày', N'Uống', 7, N'Viên'),
(3, N'Meropenem', N'1g', N'3 lần/ngày', N'Tĩnh mạch', 15, N'Lọ'),
(3, N'Norepinephrine', N'Theo bơm tiêm điện', N'Theo HA', N'Tĩnh mạch', 3, N'Ống'),
(4, N'Insulin regular', N'Theo đường huyết', N'3 lần/ngày', N'Tiêm dưới da', 2, N'Lọ');

INSERT INTO LabTests (test_code, record_id, doctor_id, test_type, ordered_date, status, result_summary) VALUES
('XN240001', 1, 1, N'Công thức máu', DATEADD(hour, -30, SYSDATETIME()), N'Đã có kết quả', N'BC tăng 14 G/L, Neu 82%'),
('XN240002', 1, 1, N'X-quang phổi', DATEADD(hour, -25, SYSDATETIME()), N'Chờ kết quả', NULL),
('XN240003', 2, 2, N'Siêu âm tim', DATEADD(hour, -20, SYSDATETIME()), N'Đang thực hiện', NULL),
('XN240004', 5, 3, N'Cấy máu', DATEADD(hour, -18, SYSDATETIME()), N'Chờ kết quả', NULL),
('XN240005', 6, 1, N'HbA1c', DATEADD(hour, -6, SYSDATETIME()), N'Đã có kết quả', N'HbA1c 9.8%'),
('XN240006', 3, 4, N'Siêu âm bụng', DATEADD(hour, -8, SYSDATETIME()), N'Đã có kết quả', N'Ruột thừa kích thước 7mm');

INSERT INTO Billing (bill_code, admission_id, consultation_fee, bed_fee, medicine_fee, lab_fee, insurance_covered, total_amount, payment_status) VALUES
('VP240001', 1, 300000, 1500000, 820000, 450000, 1200000, 1870000, N'Một phần'),
('VP240002', 2, 300000, 1200000, 650000, 950000, 1500000, 1600000, N'Chưa thanh toán'),
('VP240003', 3, 300000, 900000, 220000, 600000, 850000, 1170000, N'Đã thanh toán'),
('VP240004', 5, 500000, 2400000, 3600000, 1200000, 2800000, 4900000, N'Chưa thanh toán'),
('VP240005', 6, 300000, 300000, 180000, 280000, 450000, 610000, N'Một phần');

INSERT INTO BillingItems (billing_id, item_name, item_type, quantity, unit_price, amount) VALUES
(1, N'Giường bệnh nội trú 5 ngày', N'Giường', 5, 300000, 1500000),
(1, N'Kháng sinh Ceftriaxone', N'Thuốc', 4, 205000, 820000),
(2, N'Siêu âm tim', N'Xét nghiệm', 1, 950000, 950000),
(4, N'Giường HSCC 1 ngày', N'Giường', 1, 2400000, 2400000),
(4, N'Kháng sinh Meropenem', N'Thuốc', 6, 600000, 3600000);

INSERT INTO Discharges (admission_id, discharge_condition, discharge_date, treatment_summary, total_cost, payment_status) VALUES
(3, N'Ổn định, hết đau bụng, không chỉ định phẫu thuật', DATEADD(hour, -4, SYSDATETIME()), N'Theo dõi ngoại khoa, xét nghiệm và siêu âm không ghi nhận biến chứng. Hẹn tái khám sau 3 ngày.', 1170000, N'Đã thanh toán');

INSERT INTO Notifications (user_id, title, message, type) VALUES
(3, N'Y lệnh chưa hoàn thành', N'Bệnh nhân Đặng Mỹ Linh cần tiêm insulin lúc 11:00.', N'warning'),
(2, N'Xét nghiệm chờ kết quả', N'X-quang phổi của Nguyễn Văn An chưa có kết quả.', N'info'),
(1, N'Cảnh báo công suất', N'Phòng B201 đang sử dụng 100% giường.', N'danger');
GO
