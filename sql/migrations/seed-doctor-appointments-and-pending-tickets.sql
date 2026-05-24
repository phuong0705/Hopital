USE QuanLyKhamChuaBenhNoiTru;
GO

IF COL_LENGTH('Doctors', 'user_id') IS NULL
BEGIN
  ALTER TABLE Doctors ADD user_id INT NULL;
END;
GO

UPDATE doc
SET user_id = u.user_id
FROM Doctors doc
INNER JOIN Users u ON u.full_name = doc.full_name
INNER JOIN Roles r ON r.role_id = u.role_id
WHERE r.role_code = 'DOCTOR'
  AND doc.user_id IS NULL;
GO

IF OBJECT_ID(N'dbo.Appointments', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Appointments (
    appointment_id INT IDENTITY(1,1) PRIMARY KEY,
    appointment_code VARCHAR(40) NOT NULL UNIQUE,
    patient_id INT NULL,
    patient_name NVARCHAR(150) NOT NULL,
    phone VARCHAR(30) NULL,
    department_id INT NULL,
    doctor_id INT NULL,
    appointment_time DATETIME2 NOT NULL,
    reason NVARCHAR(500) NULL,
    status NVARCHAR(50) NOT NULL DEFAULT N'Đã đặt',
    created_by INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Appointments_Patients FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    CONSTRAINT FK_Appointments_Departments FOREIGN KEY (department_id) REFERENCES Departments(department_id),
    CONSTRAINT FK_Appointments_Doctors FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id),
    CONSTRAINT FK_Appointments_Users FOREIGN KEY (created_by) REFERENCES Users(user_id)
  );
END;
GO

IF OBJECT_ID(N'dbo.ExamTickets', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.ExamTickets (
    ticket_id INT IDENTITY(1,1) PRIMARY KEY,
    ticket_code VARCHAR(30) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    department_id INT NOT NULL,
    doctor_id INT NOT NULL,
    exam_type NVARCHAR(80) NOT NULL,
    reason NVARCHAR(1000) NOT NULL,
    is_urgent BIT NOT NULL DEFAULT 0,
    status NVARCHAR(50) NOT NULL DEFAULT N'Đã lập phiếu',
    created_by INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_ExamTickets_Patient FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    CONSTRAINT FK_ExamTickets_Department FOREIGN KEY (department_id) REFERENCES Departments(department_id),
    CONSTRAINT FK_ExamTickets_Doctor FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id),
    CONSTRAINT FK_ExamTickets_User FOREIGN KEY (created_by) REFERENCES Users(user_id)
  );
END;
GO

DECLARE @DoctorId INT;
DECLARE @DepartmentId INT;
DECLARE @CreatedBy INT;

SELECT TOP 1 @DoctorId = doc.doctor_id, @DepartmentId = doc.department_id
FROM Doctors doc
LEFT JOIN Users u ON u.user_id = doc.user_id
WHERE u.username = 'bacsi' OR doc.doctor_code = 'BS001'
ORDER BY CASE WHEN u.username = 'bacsi' THEN 0 ELSE 1 END, doc.doctor_id;

SELECT TOP 1 @CreatedBy = user_id
FROM Users
WHERE username IN ('thungan', 'admin')
ORDER BY CASE WHEN username = 'thungan' THEN 0 ELSE 1 END;

IF @DoctorId IS NULL
BEGIN
  THROW 51010, N'Không tìm thấy bác sĩ để seed lịch hẹn và phiếu khám chờ.', 1;
END;

DECLARE @SeedPatients TABLE (
  legacy_patient_code VARCHAR(30) NULL,
  patient_code VARCHAR(30) PRIMARY KEY,
  full_name NVARCHAR(150),
  date_of_birth DATE,
  gender NVARCHAR(20),
  identity_number VARCHAR(30),
  phone VARCHAR(30),
  address NVARCHAR(255),
  health_insurance_no VARCHAR(50),
  emergency_contact_name NVARCHAR(150),
  emergency_contact_phone VARCHAR(30),
  appointment_code VARCHAR(40),
  ticket_code VARCHAR(30),
  appointment_hour INT,
  reason NVARCHAR(1000),
  is_urgent BIT
);

INSERT INTO @SeedPatients (
  legacy_patient_code, patient_code, full_name, date_of_birth, gender, identity_number, phone, address,
  health_insurance_no, emergency_contact_name, emergency_contact_phone,
  appointment_code, ticket_code, appointment_hour, reason, is_urgent
)
VALUES
('BNHD001', 'BN240201', N'Nguyễn Thanh Bình', '1982-02-14', N'Nam', '079182020101', '0902101001', N'Quận 1, TP.HCM', 'DN4011000000001', N'Nguyễn Thị Hoa', '0912101001', 'LHHD001', 'PKHD001', 8, N'Tái khám nội tổng hợp, đau ngực nhẹ', 0),
('BNHD002', 'BN240202', N'Trần Mỹ Duyên', '1990-07-22', N'Nữ', '079190070202', '0902101002', N'Quận 3, TP.HCM', 'DN4011000000002', N'Trần Văn Dũng', '0912101002', 'LHHD002', 'PKHD002', 8, N'Sốt kéo dài, ho khan', 0),
('BNHD003', 'BN240203', N'Lê Quốc Hưng', '1975-11-03', N'Nam', '079175110303', '0902101003', N'Quận Bình Thạnh, TP.HCM', 'DN4011000000003', N'Lê Thị Hạnh', '0912101003', 'LHHD003', 'PKHD003', 9, N'Theo dõi tăng huyết áp', 0),
('BNHD004', 'BN240204', N'Phạm Ngọc Mai', '1988-05-19', N'Nữ', '079188050404', '0902101004', N'Thành phố Thủ Đức, TP.HCM', 'DN4011000000004', N'Phạm Văn Nam', '0912101004', 'LHHD004', 'PKHD004', 9, N'Đau thượng vị, buồn nôn', 0),
('BNHD005', 'BN240205', N'Võ Minh Khang', '1968-09-08', N'Nam', '079168090505', '0902101005', N'Quận Gò Vấp, TP.HCM', 'DN4011000000005', N'Võ Thị Thu', '0912101005', 'LHHD005', 'PKHD005', 10, N'Khó thở khi gắng sức', 1),
('BNHD006', 'BN240206', N'Đặng Thu Hà', '1995-12-27', N'Nữ', '079195120606', '0902101006', N'Quận 10, TP.HCM', 'DN4011000000006', N'Đặng Văn Hải', '0912101006', 'LHHD006', 'PKHD006', 10, N'Đau đầu, chóng mặt', 0),
('BNHD007', 'BN240207', N'Bùi Gia Bảo', '2001-04-16', N'Nam', '079101040707', '0902101007', N'Quận Tân Bình, TP.HCM', 'DN4011000000007', N'Bùi Thị Ngân', '0912101007', 'LHHD007', 'PKHD007', 13, N'Khám sau điều trị viêm phổi', 0),
('BNHD008', 'BN240208', N'Hoàng Lan Anh', '1980-01-30', N'Nữ', '079180010808', '0902101008', N'Huyện Nhà Bè, TP.HCM', 'DN4011000000008', N'Hoàng Văn Long', '0912101008', 'LHHD008', 'PKHD008', 13, N'Đường huyết cao, mệt nhiều', 0),
('BNHD009', 'BN240209', N'Đỗ Hải Nam', '1972-08-11', N'Nam', '079172080909', '0902101009', N'Quận Phú Nhuận, TP.HCM', 'DN4011000000009', N'Đỗ Thị Kim', '0912101009', 'LHHD009', 'PKHD009', 14, N'Đau ngực cần đánh giá sớm', 1),
('BNHD010', 'BN240210', N'Ngô Thảo Vy', '1999-03-25', N'Nữ', '079199031010', '0902101010', N'Quận 7, TP.HCM', 'DN4011000000010', N'Ngô Minh Tâm', '0912101010', 'LHHD010', 'PKHD010', 14, N'Mất ngủ, hồi hộp, sút cân', 0);

UPDATE p
SET patient_code = s.patient_code
FROM Patients p
INNER JOIN @SeedPatients s ON s.legacy_patient_code = p.patient_code
WHERE NOT EXISTS (
  SELECT 1
  FROM Patients existing
  WHERE existing.patient_code = s.patient_code
);

INSERT INTO Patients (
  patient_code, full_name, date_of_birth, gender, identity_number, phone, address,
  health_insurance_no, emergency_contact_name, emergency_contact_phone
)
SELECT s.patient_code, s.full_name, s.date_of_birth, s.gender, s.identity_number, s.phone, s.address,
  s.health_insurance_no, s.emergency_contact_name, s.emergency_contact_phone
FROM @SeedPatients s
WHERE NOT EXISTS (
  SELECT 1
  FROM Patients p
  WHERE p.patient_code IN (s.patient_code, s.legacy_patient_code)
);

UPDATE p
SET full_name = s.full_name,
    date_of_birth = s.date_of_birth,
    gender = s.gender,
    identity_number = s.identity_number,
    phone = s.phone,
    address = s.address,
    health_insurance_no = s.health_insurance_no,
    emergency_contact_name = s.emergency_contact_name,
    emergency_contact_phone = s.emergency_contact_phone
FROM Patients p
INNER JOIN @SeedPatients s ON s.patient_code = p.patient_code;

INSERT INTO Admissions (
  patient_id, department_id, doctor_id, room_id, bed_id, admission_date,
  initial_diagnosis, initial_condition, status, priority_level
)
SELECT
  p.patient_id,
  @DepartmentId,
  @DoctorId,
  NULL,
  NULL,
  DATEADD(minute, (src.row_no - 1) * 10,
    DATEADD(hour, src.appointment_hour, CAST(CAST(GETDATE() AS date) AS datetime2))),
  src.reason,
  N'Tiếp nhận từ lịch hẹn khám',
  N'Đang điều trị',
  CASE WHEN src.is_urgent = 1 THEN N'Cao' ELSE N'Trung bình' END
FROM (
  SELECT s.*, ROW_NUMBER() OVER (ORDER BY s.patient_code) AS row_no
  FROM @SeedPatients s
) src
INNER JOIN Patients p ON p.patient_code = src.patient_code
WHERE NOT EXISTS (
  SELECT 1
  FROM Admissions a
  WHERE a.patient_id = p.patient_id
    AND a.doctor_id = @DoctorId
    AND a.status <> N'Đã hủy'
);

INSERT INTO MedicalRecords (
  record_code, patient_id, admission_id, diagnosis_on_admission,
  medical_history, allergies, vital_signs, doctor_notes, status
)
SELECT
  CONCAT('HS', p.patient_code),
  p.patient_id,
  a.admission_id,
  s.reason,
  N'Chưa ghi nhận',
  N'Chưa ghi nhận',
  N'Mạch: --; Huyết áp: --; Nhiệt độ: --; SpO2: --',
  N'Hồ sơ bệnh án được tạo tự động từ dữ liệu tiếp nhận/lịch hẹn mẫu.',
  a.status
FROM @SeedPatients s
INNER JOIN Patients p ON p.patient_code = s.patient_code
INNER JOIN Admissions a ON a.patient_id = p.patient_id AND a.doctor_id = @DoctorId
WHERE NOT EXISTS (
  SELECT 1
  FROM MedicalRecords mr
  WHERE mr.admission_id = a.admission_id
)
  AND NOT EXISTS (
    SELECT 1
    FROM MedicalRecords mr
    WHERE mr.record_code = CONCAT('HS', p.patient_code)
  );

INSERT INTO Appointments (
  appointment_code, patient_id, patient_name, phone, department_id, doctor_id,
  appointment_time, reason, status, created_by
)
SELECT
  s.appointment_code,
  p.patient_id,
  p.full_name,
  p.phone,
  @DepartmentId,
  @DoctorId,
  DATEADD(minute, (ROW_NUMBER() OVER (ORDER BY s.patient_code) - 1) * 10,
    DATEADD(hour, s.appointment_hour, CAST(CAST(GETDATE() AS date) AS datetime2))),
  s.reason,
  N'Chưa khám',
  @CreatedBy
FROM @SeedPatients s
INNER JOIN Patients p ON p.patient_code = s.patient_code
WHERE NOT EXISTS (
  SELECT 1
  FROM Appointments a
  WHERE a.appointment_code = s.appointment_code
);

UPDATE a
SET patient_id = p.patient_id,
    patient_name = p.full_name,
    phone = p.phone,
    department_id = @DepartmentId,
    doctor_id = @DoctorId,
    appointment_time = DATEADD(minute, (src.row_no - 1) * 10,
      DATEADD(hour, src.appointment_hour, CAST(CAST(GETDATE() AS date) AS datetime2))),
    reason = src.reason,
    status = N'Chưa khám',
    created_by = @CreatedBy
FROM Appointments a
INNER JOIN (
  SELECT s.*, ROW_NUMBER() OVER (ORDER BY s.patient_code) AS row_no
  FROM @SeedPatients s
) src ON src.appointment_code = a.appointment_code
INNER JOIN Patients p ON p.patient_code = src.patient_code;

INSERT INTO ExamTickets (
  ticket_code, patient_id, department_id, doctor_id, exam_type, reason, is_urgent, status, created_by
)
SELECT
  s.ticket_code,
  p.patient_id,
  @DepartmentId,
  @DoctorId,
  N'Khám thường',
  s.reason,
  s.is_urgent,
  N'Đã lập phiếu',
  @CreatedBy
FROM @SeedPatients s
INNER JOIN Patients p ON p.patient_code = s.patient_code
WHERE NOT EXISTS (
  SELECT 1
  FROM ExamTickets et
  WHERE et.ticket_code = s.ticket_code
);

UPDATE et
SET patient_id = p.patient_id,
    department_id = @DepartmentId,
    doctor_id = @DoctorId,
    exam_type = N'Khám thường',
    reason = s.reason,
    is_urgent = s.is_urgent,
    status = N'Đã lập phiếu',
    created_by = @CreatedBy
FROM ExamTickets et
INNER JOIN @SeedPatients s ON s.ticket_code = et.ticket_code
INNER JOIN Patients p ON p.patient_code = s.patient_code;
GO
