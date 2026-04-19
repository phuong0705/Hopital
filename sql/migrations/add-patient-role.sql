USE QuanLyKhamChuaBenhNoiTru;
GO

IF NOT EXISTS (SELECT 1 FROM Roles WHERE role_code = 'PATIENT')
BEGIN
  INSERT INTO Roles (role_code, role_name, description)
  VALUES ('PATIENT', N'Bệnh nhân', N'Xem hồ sơ cá nhân, lịch điều trị, đơn thuốc, xét nghiệm và viện phí của chính mình');
END
GO

IF COL_LENGTH('Users', 'patient_id') IS NULL
BEGIN
  ALTER TABLE Users ADD patient_id INT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Users_Patients')
BEGIN
  ALTER TABLE Users
  ADD CONSTRAINT FK_Users_Patients FOREIGN KEY (patient_id) REFERENCES Patients(patient_id);
END
GO

IF NOT EXISTS (SELECT 1 FROM Users WHERE username = 'benhnhan')
BEGIN
  INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
  SELECT r.role_id, 'benhnhan', 'benhnhan@benhvien.vn', '123456', p.full_name, p.patient_id, N'Hoạt động'
  FROM Roles r
  CROSS JOIN Patients p
  WHERE r.role_code = 'PATIENT' AND p.patient_code = 'BN240001';
END
GO
