USE QuanLyKhamChuaBenhNoiTru;
GO

DECLARE @DoctorRoleId INT = (SELECT role_id FROM Roles WHERE role_code = 'DOCTOR');
DECLARE @NurseRoleId INT = (SELECT role_id FROM Roles WHERE role_code = 'NURSE');
DECLARE @ReceptionistRoleId INT = (SELECT role_id FROM Roles WHERE role_code = 'RECEPTIONIST');
DECLARE @PatientRoleId INT = (SELECT role_id FROM Roles WHERE role_code = 'PATIENT');

-- Seed 10 Doctors

INSERT INTO Doctors (department_id, doctor_code, full_name, specialty, phone, email, shift_name)
VALUES (2, 'BS201', N'Nguyễn Đức Hạnh', N'Bác sĩ nội trú', '0339670735', 'doctor1@benhvien.vn', N'Ca hành chính');
INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@DoctorRoleId, 'doctor1', 'doctor1@benhvien.vn', '123456', N'Nguyễn Đức Hạnh', N'Hoạt động');

INSERT INTO Doctors (department_id, doctor_code, full_name, specialty, phone, email, shift_name)
VALUES (3, 'BS202', N'Bùi Minh An', N'Bác sĩ nội trú', '0995661806', 'doctor2@benhvien.vn', N'Ca hành chính');
INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@DoctorRoleId, 'doctor2', 'doctor2@benhvien.vn', '123456', N'Bùi Minh An', N'Hoạt động');

INSERT INTO Doctors (department_id, doctor_code, full_name, specialty, phone, email, shift_name)
VALUES (4, 'BS203', N'Vũ Hữu Giang', N'Bác sĩ nội trú', '0367289634', 'doctor3@benhvien.vn', N'Ca hành chính');
INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@DoctorRoleId, 'doctor3', 'doctor3@benhvien.vn', '123456', N'Vũ Hữu Giang', N'Hoạt động');

INSERT INTO Doctors (department_id, doctor_code, full_name, specialty, phone, email, shift_name)
VALUES (5, 'BS204', N'Bùi Quang Bình', N'Bác sĩ nội trú', '0923117753', 'doctor4@benhvien.vn', N'Ca hành chính');
INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@DoctorRoleId, 'doctor4', 'doctor4@benhvien.vn', '123456', N'Bùi Quang Bình', N'Hoạt động');

INSERT INTO Doctors (department_id, doctor_code, full_name, specialty, phone, email, shift_name)
VALUES (1, 'BS205', N'Hoàng Thanh Mai', N'Bác sĩ nội trú', '0414184600', 'doctor5@benhvien.vn', N'Ca hành chính');
INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@DoctorRoleId, 'doctor5', 'doctor5@benhvien.vn', '123456', N'Hoàng Thanh Mai', N'Hoạt động');

INSERT INTO Doctors (department_id, doctor_code, full_name, specialty, phone, email, shift_name)
VALUES (2, 'BS206', N'Phạm Minh Linh', N'Bác sĩ nội trú', '0233046520', 'doctor6@benhvien.vn', N'Ca hành chính');
INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@DoctorRoleId, 'doctor6', 'doctor6@benhvien.vn', '123456', N'Phạm Minh Linh', N'Hoạt động');

INSERT INTO Doctors (department_id, doctor_code, full_name, specialty, phone, email, shift_name)
VALUES (3, 'BS207', N'Nguyễn Hữu Lan', N'Bác sĩ nội trú', '0169222063', 'doctor7@benhvien.vn', N'Ca hành chính');
INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@DoctorRoleId, 'doctor7', 'doctor7@benhvien.vn', '123456', N'Nguyễn Hữu Lan', N'Hoạt động');

INSERT INTO Doctors (department_id, doctor_code, full_name, specialty, phone, email, shift_name)
VALUES (4, 'BS208', N'Vũ Ngọc Sơn', N'Bác sĩ nội trú', '0829919074', 'doctor8@benhvien.vn', N'Ca hành chính');
INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@DoctorRoleId, 'doctor8', 'doctor8@benhvien.vn', '123456', N'Vũ Ngọc Sơn', N'Hoạt động');

INSERT INTO Doctors (department_id, doctor_code, full_name, specialty, phone, email, shift_name)
VALUES (5, 'BS209', N'Nguyễn Anh Cường', N'Bác sĩ nội trú', '0876652705', 'doctor9@benhvien.vn', N'Ca hành chính');
INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@DoctorRoleId, 'doctor9', 'doctor9@benhvien.vn', '123456', N'Nguyễn Anh Cường', N'Hoạt động');

INSERT INTO Doctors (department_id, doctor_code, full_name, specialty, phone, email, shift_name)
VALUES (1, 'BS210', N'Nguyễn Đức Hạnh', N'Bác sĩ nội trú', '0494466687', 'doctor10@benhvien.vn', N'Ca hành chính');
INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@DoctorRoleId, 'doctor10', 'doctor10@benhvien.vn', '123456', N'Nguyễn Đức Hạnh', N'Hoạt động');

-- Seed 10 Cashiers

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@ReceptionistRoleId, 'cashier1', 'cashier1@benhvien.vn', '123456', N'Lê Thị Minh', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@ReceptionistRoleId, 'cashier2', 'cashier2@benhvien.vn', '123456', N'Bùi Anh Hùng', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@ReceptionistRoleId, 'cashier3', 'cashier3@benhvien.vn', '123456', N'Vũ Anh An', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@ReceptionistRoleId, 'cashier4', 'cashier4@benhvien.vn', '123456', N'Nguyễn Ngọc An', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@ReceptionistRoleId, 'cashier5', 'cashier5@benhvien.vn', '123456', N'Đặng Anh Linh', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@ReceptionistRoleId, 'cashier6', 'cashier6@benhvien.vn', '123456', N'Lê Kim Long', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@ReceptionistRoleId, 'cashier7', 'cashier7@benhvien.vn', '123456', N'Đặng Kim Lan', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@ReceptionistRoleId, 'cashier8', 'cashier8@benhvien.vn', '123456', N'Bùi Minh Hoa', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@ReceptionistRoleId, 'cashier9', 'cashier9@benhvien.vn', '123456', N'Hoàng Thị Hạnh', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@ReceptionistRoleId, 'cashier10', 'cashier10@benhvien.vn', '123456', N'Trần Quang Khánh', N'Hoạt động');

-- Seed 20 Nurses

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse1', 'nurse1@benhvien.vn', '123456', N'Hoàng Thị Hà', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse2', 'nurse2@benhvien.vn', '123456', N'Nguyễn Kim Hạnh', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse3', 'nurse3@benhvien.vn', '123456', N'Đặng Thị Giang', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse4', 'nurse4@benhvien.vn', '123456', N'Trần Anh Long', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse5', 'nurse5@benhvien.vn', '123456', N'Hoàng Kim Khánh', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse6', 'nurse6@benhvien.vn', '123456', N'Huỳnh Quang Khánh', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse7', 'nurse7@benhvien.vn', '123456', N'Phan Đức Hùng', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse8', 'nurse8@benhvien.vn', '123456', N'Vũ Kim Bình', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse9', 'nurse9@benhvien.vn', '123456', N'Lê Kim Linh', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse10', 'nurse10@benhvien.vn', '123456', N'Đặng Quang Dũng', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse11', 'nurse11@benhvien.vn', '123456', N'Vũ Minh Cường', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse12', 'nurse12@benhvien.vn', '123456', N'Trần Anh Khánh', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse13', 'nurse13@benhvien.vn', '123456', N'Vũ Hữu Sơn', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse14', 'nurse14@benhvien.vn', '123456', N'Đặng Văn Mai', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse15', 'nurse15@benhvien.vn', '123456', N'Phạm Anh Minh', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse16', 'nurse16@benhvien.vn', '123456', N'Nguyễn Văn Lan', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse17', 'nurse17@benhvien.vn', '123456', N'Phạm Quang Dũng', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse18', 'nurse18@benhvien.vn', '123456', N'Trần Kim Bình', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse19', 'nurse19@benhvien.vn', '123456', N'Nguyễn Minh Long', N'Hoạt động');

INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
VALUES (@NurseRoleId, 'nurse20', 'nurse20@benhvien.vn', '123456', N'Bùi Hữu Linh', N'Hoạt động');

-- Seed 100 Patients

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240101', N'Hoàng Ngọc Bình', '2008-09-25', N'Nam', '676542846526', '0201931493', N'Hồ Chí Minh', 'GD479938223994');

DECLARE @p_id_1 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_1, 2, 2, DATEADD(day, -6, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240101', @p_id_1, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient1', 'patient1@benhvien.vn', '123456', N'Hoàng Ngọc Bình', @p_id_1, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240102', N'Trần Thanh Dương', '1966-06-18', N'Nam', '419836533471', '0485547759', N'Hồ Chí Minh', 'GD479741414730');

DECLARE @p_id_2 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_2, 3, 3, DATEADD(day, -8, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240102', @p_id_2, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient2', 'patient2@benhvien.vn', '123456', N'Trần Thanh Dương', @p_id_2, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240103', N'Vũ Hữu Mai', '1959-03-25', N'Nữ', '140346422419', '0213467092', N'Hồ Chí Minh', 'GD479710850789');

DECLARE @p_id_3 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_3, 4, 4, DATEADD(day, -7, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240103', @p_id_3, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient3', 'patient3@benhvien.vn', '123456', N'Vũ Hữu Mai', @p_id_3, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240104', N'Lê Quang Linh', '1995-01-15', N'Nam', '775405800420', '0637674531', N'Hồ Chí Minh', 'GD479411767267');

DECLARE @p_id_4 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_4, 5, 5, DATEADD(day, -9, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240104', @p_id_4, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient4', 'patient4@benhvien.vn', '123456', N'Lê Quang Linh', @p_id_4, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240105', N'Phan Thị Dũng', '1989-02-01', N'Nữ', '716224506399', '0822869211', N'Hồ Chí Minh', 'GD479659383152');

DECLARE @p_id_5 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_5, 1, 1, DATEADD(day, -7, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240105', @p_id_5, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient5', 'patient5@benhvien.vn', '123456', N'Phan Thị Dũng', @p_id_5, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240106', N'Phạm Quang Chi', '1977-05-13', N'Nam', '532065147335', '0161761657', N'Hồ Chí Minh', 'GD479983967371');

DECLARE @p_id_6 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_6, 2, 2, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240106', @p_id_6, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient6', 'patient6@benhvien.vn', '123456', N'Phạm Quang Chi', @p_id_6, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240107', N'Đặng Quang Dũng', '1978-02-15', N'Nữ', '515951602760', '0670903933', N'Hồ Chí Minh', 'GD479169862508');

DECLARE @p_id_7 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_7, 3, 3, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240107', @p_id_7, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient7', 'patient7@benhvien.vn', '123456', N'Đặng Quang Dũng', @p_id_7, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240108', N'Lê Văn Hùng', '1969-06-05', N'Nữ', '206964597964', '0444408549', N'Hồ Chí Minh', 'GD479667510966');

DECLARE @p_id_8 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_8, 4, 4, DATEADD(day, -3, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240108', @p_id_8, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient8', 'patient8@benhvien.vn', '123456', N'Lê Văn Hùng', @p_id_8, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240109', N'Nguyễn Văn Tú', '1968-11-25', N'Nữ', '634068871046', '0292326133', N'Hồ Chí Minh', 'GD479776282478');

DECLARE @p_id_9 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_9, 5, 5, DATEADD(day, -0, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240109', @p_id_9, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient9', 'patient9@benhvien.vn', '123456', N'Nguyễn Văn Tú', @p_id_9, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240110', N'Trần Quang Cường', '2004-10-04', N'Nam', '873191277555', '0442931542', N'Hồ Chí Minh', 'GD479148493481');

DECLARE @p_id_10 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_10, 1, 1, DATEADD(day, -7, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240110', @p_id_10, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient10', 'patient10@benhvien.vn', '123456', N'Trần Quang Cường', @p_id_10, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240111', N'Hoàng Thị Long', '2003-01-19', N'Nam', '206851986980', '0900160060', N'Hồ Chí Minh', 'GD479572391800');

DECLARE @p_id_11 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_11, 2, 2, DATEADD(day, -6, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240111', @p_id_11, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient11', 'patient11@benhvien.vn', '123456', N'Hoàng Thị Long', @p_id_11, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240112', N'Phạm Anh Bình', '1983-08-14', N'Nam', '829165403743', '0107197518', N'Hồ Chí Minh', 'GD479958163287');

DECLARE @p_id_12 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_12, 3, 3, DATEADD(day, -1, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240112', @p_id_12, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient12', 'patient12@benhvien.vn', '123456', N'Phạm Anh Bình', @p_id_12, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240113', N'Vũ Kim Bình', '1988-02-06', N'Nữ', '684716049605', '0771429788', N'Hồ Chí Minh', 'GD479218597314');

DECLARE @p_id_13 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_13, 4, 4, DATEADD(day, -9, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240113', @p_id_13, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient13', 'patient13@benhvien.vn', '123456', N'Vũ Kim Bình', @p_id_13, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240114', N'Hoàng Ngọc Chi', '2001-12-21', N'Nữ', '624038931008', '0898739615', N'Hồ Chí Minh', 'GD479368782181');

DECLARE @p_id_14 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_14, 5, 5, DATEADD(day, -5, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240114', @p_id_14, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient14', 'patient14@benhvien.vn', '123456', N'Hoàng Ngọc Chi', @p_id_14, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240115', N'Trần Kim Minh', '1995-01-02', N'Nam', '325614907176', '0527406268', N'Hồ Chí Minh', 'GD47910525730');

DECLARE @p_id_15 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_15, 1, 1, DATEADD(day, -6, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240115', @p_id_15, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient15', 'patient15@benhvien.vn', '123456', N'Trần Kim Minh', @p_id_15, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240116', N'Đặng Hữu Long', '1972-09-20', N'Nam', '919230636035', '0778535000', N'Hồ Chí Minh', 'GD479114555383');

DECLARE @p_id_16 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_16, 2, 2, DATEADD(day, -9, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240116', @p_id_16, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient16', 'patient16@benhvien.vn', '123456', N'Đặng Hữu Long', @p_id_16, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240117', N'Huỳnh Anh Sơn', '2002-12-09', N'Nữ', '311360281903', '0593028960', N'Hồ Chí Minh', 'GD479116932592');

DECLARE @p_id_17 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_17, 3, 3, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240117', @p_id_17, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient17', 'patient17@benhvien.vn', '123456', N'Huỳnh Anh Sơn', @p_id_17, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240118', N'Đặng Minh Dũng', '1976-07-11', N'Nam', '222305936991', '0498792236', N'Hồ Chí Minh', 'GD479717363463');

DECLARE @p_id_18 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_18, 4, 4, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240118', @p_id_18, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient18', 'patient18@benhvien.vn', '123456', N'Đặng Minh Dũng', @p_id_18, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240119', N'Nguyễn Anh Minh', '1972-01-25', N'Nam', '447661012983', '0854768181', N'Hồ Chí Minh', 'GD479910798831');

DECLARE @p_id_19 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_19, 5, 5, DATEADD(day, -7, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240119', @p_id_19, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient19', 'patient19@benhvien.vn', '123456', N'Nguyễn Anh Minh', @p_id_19, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240120', N'Trần Anh Hùng', '2005-11-15', N'Nam', '303620689235', '0942912005', N'Hồ Chí Minh', 'GD479151379578');

DECLARE @p_id_20 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_20, 1, 1, DATEADD(day, -8, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240120', @p_id_20, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient20', 'patient20@benhvien.vn', '123456', N'Trần Anh Hùng', @p_id_20, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240121', N'Bùi Kim Hạnh', '1969-01-19', N'Nữ', '760443233006', '0226738583', N'Hồ Chí Minh', 'GD479546024212');

DECLARE @p_id_21 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_21, 2, 2, DATEADD(day, -5, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240121', @p_id_21, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient21', 'patient21@benhvien.vn', '123456', N'Bùi Kim Hạnh', @p_id_21, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240122', N'Hoàng Quang Giang', '1975-02-08', N'Nam', '561891511576', '0532789948', N'Hồ Chí Minh', 'GD479495005193');

DECLARE @p_id_22 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_22, 3, 3, DATEADD(day, -8, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240122', @p_id_22, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient22', 'patient22@benhvien.vn', '123456', N'Hoàng Quang Giang', @p_id_22, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240123', N'Huỳnh Ngọc An', '1982-11-16', N'Nữ', '950209481592', '0538226831', N'Hồ Chí Minh', 'GD479538316490');

DECLARE @p_id_23 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_23, 4, 4, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240123', @p_id_23, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient23', 'patient23@benhvien.vn', '123456', N'Huỳnh Ngọc An', @p_id_23, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240124', N'Phạm Văn Mai', '1994-06-20', N'Nam', '789102736035', '0198979994', N'Hồ Chí Minh', 'GD47998163098');

DECLARE @p_id_24 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_24, 5, 5, DATEADD(day, -8, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240124', @p_id_24, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient24', 'patient24@benhvien.vn', '123456', N'Phạm Văn Mai', @p_id_24, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240125', N'Vũ Thị Giang', '1993-06-21', N'Nam', '174748212344', '0301149107', N'Hồ Chí Minh', 'GD479564835517');

DECLARE @p_id_25 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_25, 1, 1, DATEADD(day, -7, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240125', @p_id_25, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient25', 'patient25@benhvien.vn', '123456', N'Vũ Thị Giang', @p_id_25, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240126', N'Hoàng Hữu Giang', '1975-06-18', N'Nữ', '785905343859', '0394456666', N'Hồ Chí Minh', 'GD479448049531');

DECLARE @p_id_26 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_26, 2, 2, DATEADD(day, -9, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240126', @p_id_26, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient26', 'patient26@benhvien.vn', '123456', N'Hoàng Hữu Giang', @p_id_26, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240127', N'Nguyễn Minh Hoa', '1989-04-04', N'Nữ', '643746291291', '0460699592', N'Hồ Chí Minh', 'GD479828287143');

DECLARE @p_id_27 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_27, 3, 3, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240127', @p_id_27, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient27', 'patient27@benhvien.vn', '123456', N'Nguyễn Minh Hoa', @p_id_27, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240128', N'Vũ Đức Dũng', '1991-09-05', N'Nữ', '857131203879', '0490432382', N'Hồ Chí Minh', 'GD479182487438');

DECLARE @p_id_28 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_28, 4, 4, DATEADD(day, -9, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240128', @p_id_28, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient28', 'patient28@benhvien.vn', '123456', N'Vũ Đức Dũng', @p_id_28, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240129', N'Hoàng Minh An', '2002-11-09', N'Nữ', '793443986704', '0824004630', N'Hồ Chí Minh', 'GD479121296297');

DECLARE @p_id_29 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_29, 5, 5, DATEADD(day, -6, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240129', @p_id_29, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient29', 'patient29@benhvien.vn', '123456', N'Hoàng Minh An', @p_id_29, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240130', N'Huỳnh Đức An', '2009-06-24', N'Nữ', '349504869918', '0399966110', N'Hồ Chí Minh', 'GD479658508626');

DECLARE @p_id_30 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_30, 1, 1, DATEADD(day, -0, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240130', @p_id_30, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient30', 'patient30@benhvien.vn', '123456', N'Huỳnh Đức An', @p_id_30, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240131', N'Hoàng Hữu Bình', '1975-11-27', N'Nam', '458909422919', '0356691679', N'Hồ Chí Minh', 'GD479229463825');

DECLARE @p_id_31 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_31, 2, 2, DATEADD(day, -6, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240131', @p_id_31, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient31', 'patient31@benhvien.vn', '123456', N'Hoàng Hữu Bình', @p_id_31, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240132', N'Phan Hữu Linh', '1976-12-26', N'Nam', '556193604470', '0723307485', N'Hồ Chí Minh', 'GD479388423005');

DECLARE @p_id_32 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_32, 3, 3, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240132', @p_id_32, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient32', 'patient32@benhvien.vn', '123456', N'Phan Hữu Linh', @p_id_32, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240133', N'Phan Thị Dương', '1997-06-21', N'Nam', '848711612257', '0820801685', N'Hồ Chí Minh', 'GD479606713236');

DECLARE @p_id_33 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_33, 4, 4, DATEADD(day, -7, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240133', @p_id_33, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient33', 'patient33@benhvien.vn', '123456', N'Phan Thị Dương', @p_id_33, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240134', N'Trần Quang Giang', '2007-08-19', N'Nam', '190256778190', '0387493526', N'Hồ Chí Minh', 'GD479577583892');

DECLARE @p_id_34 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_34, 5, 5, DATEADD(day, -3, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240134', @p_id_34, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient34', 'patient34@benhvien.vn', '123456', N'Trần Quang Giang', @p_id_34, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240135', N'Trần Văn Tú', '1981-08-01', N'Nữ', '940154688748', '0810301942', N'Hồ Chí Minh', 'GD479854650522');

DECLARE @p_id_35 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_35, 1, 1, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240135', @p_id_35, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient35', 'patient35@benhvien.vn', '123456', N'Trần Văn Tú', @p_id_35, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240136', N'Vũ Anh Sơn', '1950-12-06', N'Nam', '456501050557', '0992664551', N'Hồ Chí Minh', 'GD479848180086');

DECLARE @p_id_36 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_36, 2, 2, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240136', @p_id_36, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient36', 'patient36@benhvien.vn', '123456', N'Vũ Anh Sơn', @p_id_36, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240137', N'Trần Đức Nam', '1983-02-08', N'Nữ', '759288137768', '0208861947', N'Hồ Chí Minh', 'GD479339917057');

DECLARE @p_id_37 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_37, 3, 3, DATEADD(day, -0, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240137', @p_id_37, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient37', 'patient37@benhvien.vn', '123456', N'Trần Đức Nam', @p_id_37, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240138', N'Bùi Ngọc Hà', '2009-12-24', N'Nam', '104688740048', '0532534172', N'Hồ Chí Minh', 'GD479443953758');

DECLARE @p_id_38 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_38, 4, 4, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240138', @p_id_38, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient38', 'patient38@benhvien.vn', '123456', N'Bùi Ngọc Hà', @p_id_38, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240139', N'Phạm Văn Dũng', '1955-10-05', N'Nam', '604094510568', '0820518528', N'Hồ Chí Minh', 'GD479653508650');

DECLARE @p_id_39 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_39, 5, 5, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240139', @p_id_39, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient39', 'patient39@benhvien.vn', '123456', N'Phạm Văn Dũng', @p_id_39, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240140', N'Nguyễn Văn Tú', '2006-03-10', N'Nam', '545719735960', '0549801231', N'Hồ Chí Minh', 'GD47954916508');

DECLARE @p_id_40 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_40, 1, 1, DATEADD(day, -0, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240140', @p_id_40, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient40', 'patient40@benhvien.vn', '123456', N'Nguyễn Văn Tú', @p_id_40, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240141', N'Phan Quang Giang', '1998-01-10', N'Nam', '887283944913', '0871179543', N'Hồ Chí Minh', 'GD479184772511');

DECLARE @p_id_41 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_41, 2, 2, DATEADD(day, -6, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240141', @p_id_41, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient41', 'patient41@benhvien.vn', '123456', N'Phan Quang Giang', @p_id_41, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240142', N'Bùi Thanh Hà', '1953-05-21', N'Nam', '836016955240', '0625534759', N'Hồ Chí Minh', 'GD479239171799');

DECLARE @p_id_42 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_42, 3, 3, DATEADD(day, -9, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240142', @p_id_42, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient42', 'patient42@benhvien.vn', '123456', N'Bùi Thanh Hà', @p_id_42, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240143', N'Đặng Đức Giang', '1969-05-19', N'Nữ', '720746665157', '0180513162', N'Hồ Chí Minh', 'GD479743993531');

DECLARE @p_id_43 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_43, 4, 4, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240143', @p_id_43, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient43', 'patient43@benhvien.vn', '123456', N'Đặng Đức Giang', @p_id_43, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240144', N'Nguyễn Anh Giang', '1998-08-05', N'Nữ', '356852926808', '0801718304', N'Hồ Chí Minh', 'GD479155682642');

DECLARE @p_id_44 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_44, 5, 5, DATEADD(day, -0, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240144', @p_id_44, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient44', 'patient44@benhvien.vn', '123456', N'Nguyễn Anh Giang', @p_id_44, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240145', N'Phan Thanh Long', '1958-01-28', N'Nam', '878400245566', '0130482467', N'Hồ Chí Minh', 'GD479620481287');

DECLARE @p_id_45 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_45, 1, 1, DATEADD(day, -5, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240145', @p_id_45, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient45', 'patient45@benhvien.vn', '123456', N'Phan Thanh Long', @p_id_45, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240146', N'Lê Văn Nam', '1957-08-26', N'Nữ', '891614891534', '0198055992', N'Hồ Chí Minh', 'GD47995655546');

DECLARE @p_id_46 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_46, 2, 2, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240146', @p_id_46, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient46', 'patient46@benhvien.vn', '123456', N'Lê Văn Nam', @p_id_46, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240147', N'Huỳnh Quang Lan', '1963-06-10', N'Nữ', '214863673314', '0784006399', N'Hồ Chí Minh', 'GD479103706118');

DECLARE @p_id_47 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_47, 3, 3, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240147', @p_id_47, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient47', 'patient47@benhvien.vn', '123456', N'Huỳnh Quang Lan', @p_id_47, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240148', N'Trần Hữu Minh', '1986-10-21', N'Nam', '490626202742', '0597376967', N'Hồ Chí Minh', 'GD479214749673');

DECLARE @p_id_48 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_48, 4, 4, DATEADD(day, -9, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240148', @p_id_48, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient48', 'patient48@benhvien.vn', '123456', N'Trần Hữu Minh', @p_id_48, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240149', N'Lê Thị Sơn', '1993-03-27', N'Nam', '245177562577', '0841493365', N'Hồ Chí Minh', 'GD479523746906');

DECLARE @p_id_49 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_49, 5, 5, DATEADD(day, -6, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240149', @p_id_49, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient49', 'patient49@benhvien.vn', '123456', N'Lê Thị Sơn', @p_id_49, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240150', N'Lê Kim Sơn', '1971-11-18', N'Nam', '772604010402', '0264351933', N'Hồ Chí Minh', 'GD47965219700');

DECLARE @p_id_50 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_50, 1, 1, DATEADD(day, -5, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240150', @p_id_50, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient50', 'patient50@benhvien.vn', '123456', N'Lê Kim Sơn', @p_id_50, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240151', N'Hoàng Thị Hoa', '1993-03-17', N'Nam', '616144473518', '0787618158', N'Hồ Chí Minh', 'GD47959764667');

DECLARE @p_id_51 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_51, 2, 2, DATEADD(day, -0, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240151', @p_id_51, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient51', 'patient51@benhvien.vn', '123456', N'Hoàng Thị Hoa', @p_id_51, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240152', N'Phan Thị An', '1981-12-14', N'Nam', '990735481451', '0237472830', N'Hồ Chí Minh', 'GD479291501708');

DECLARE @p_id_52 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_52, 3, 3, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240152', @p_id_52, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient52', 'patient52@benhvien.vn', '123456', N'Phan Thị An', @p_id_52, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240153', N'Bùi Anh Tú', '1985-10-10', N'Nam', '421550918055', '0538663959', N'Hồ Chí Minh', 'GD479273972437');

DECLARE @p_id_53 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_53, 4, 4, DATEADD(day, -7, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240153', @p_id_53, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient53', 'patient53@benhvien.vn', '123456', N'Bùi Anh Tú', @p_id_53, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240154', N'Nguyễn Minh Nam', '1992-02-28', N'Nam', '117568890151', '0104194647', N'Hồ Chí Minh', 'GD47991682442');

DECLARE @p_id_54 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_54, 5, 5, DATEADD(day, -6, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240154', @p_id_54, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient54', 'patient54@benhvien.vn', '123456', N'Nguyễn Minh Nam', @p_id_54, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240155', N'Nguyễn Hữu Hạnh', '1975-02-23', N'Nữ', '261349022241', '0108010470', N'Hồ Chí Minh', 'GD479390254652');

DECLARE @p_id_55 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_55, 1, 1, DATEADD(day, -5, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240155', @p_id_55, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient55', 'patient55@benhvien.vn', '123456', N'Nguyễn Hữu Hạnh', @p_id_55, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240156', N'Vũ Anh An', '1976-04-28', N'Nữ', '473765060005', '0723428217', N'Hồ Chí Minh', 'GD479289957948');

DECLARE @p_id_56 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_56, 2, 2, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240156', @p_id_56, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient56', 'patient56@benhvien.vn', '123456', N'Vũ Anh An', @p_id_56, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240157', N'Đặng Minh Hùng', '1988-06-03', N'Nam', '926007246099', '0304934693', N'Hồ Chí Minh', 'GD479424548117');

DECLARE @p_id_57 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_57, 3, 3, DATEADD(day, -5, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240157', @p_id_57, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient57', 'patient57@benhvien.vn', '123456', N'Đặng Minh Hùng', @p_id_57, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240158', N'Huỳnh Ngọc An', '1994-08-21', N'Nam', '268925218683', '0127355264', N'Hồ Chí Minh', 'GD479298566041');

DECLARE @p_id_58 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_58, 4, 4, DATEADD(day, -7, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240158', @p_id_58, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient58', 'patient58@benhvien.vn', '123456', N'Huỳnh Ngọc An', @p_id_58, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240159', N'Vũ Minh Chi', '2008-09-21', N'Nữ', '450731489047', '0569862226', N'Hồ Chí Minh', 'GD479602191148');

DECLARE @p_id_59 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_59, 5, 5, DATEADD(day, -7, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240159', @p_id_59, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient59', 'patient59@benhvien.vn', '123456', N'Vũ Minh Chi', @p_id_59, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240160', N'Phạm Minh Hạnh', '2005-01-06', N'Nữ', '279765297820', '0701511729', N'Hồ Chí Minh', 'GD479176607812');

DECLARE @p_id_60 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_60, 1, 1, DATEADD(day, -8, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240160', @p_id_60, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient60', 'patient60@benhvien.vn', '123456', N'Phạm Minh Hạnh', @p_id_60, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240161', N'Lê Thị Tú', '1958-02-09', N'Nữ', '975884117288', '0400830541', N'Hồ Chí Minh', 'GD479369177931');

DECLARE @p_id_61 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_61, 2, 2, DATEADD(day, -3, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240161', @p_id_61, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient61', 'patient61@benhvien.vn', '123456', N'Lê Thị Tú', @p_id_61, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240162', N'Phan Anh Dũng', '1982-02-23', N'Nữ', '408239110774', '0401912964', N'Hồ Chí Minh', 'GD479351908605');

DECLARE @p_id_62 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_62, 3, 3, DATEADD(day, -9, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240162', @p_id_62, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient62', 'patient62@benhvien.vn', '123456', N'Phan Anh Dũng', @p_id_62, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240163', N'Huỳnh Văn Hoa', '1967-05-27', N'Nam', '111770237755', '0841585961', N'Hồ Chí Minh', 'GD479857288723');

DECLARE @p_id_63 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_63, 4, 4, DATEADD(day, -1, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240163', @p_id_63, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient63', 'patient63@benhvien.vn', '123456', N'Huỳnh Văn Hoa', @p_id_63, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240164', N'Trần Kim Giang', '2005-09-20', N'Nữ', '467328566087', '0384568916', N'Hồ Chí Minh', 'GD479530750103');

DECLARE @p_id_64 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_64, 5, 5, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240164', @p_id_64, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient64', 'patient64@benhvien.vn', '123456', N'Trần Kim Giang', @p_id_64, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240165', N'Phạm Văn Hùng', '2005-08-28', N'Nam', '227370086761', '0787694477', N'Hồ Chí Minh', 'GD47997081303');

DECLARE @p_id_65 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_65, 1, 1, DATEADD(day, -9, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240165', @p_id_65, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient65', 'patient65@benhvien.vn', '123456', N'Phạm Văn Hùng', @p_id_65, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240166', N'Bùi Anh Dũng', '1954-08-21', N'Nữ', '578634145328', '0629314169', N'Hồ Chí Minh', 'GD479969869482');

DECLARE @p_id_66 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_66, 2, 2, DATEADD(day, -6, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240166', @p_id_66, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient66', 'patient66@benhvien.vn', '123456', N'Bùi Anh Dũng', @p_id_66, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240167', N'Phạm Văn Long', '1956-10-28', N'Nữ', '103930749763', '0988461459', N'Hồ Chí Minh', 'GD479976266982');

DECLARE @p_id_67 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_67, 3, 3, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240167', @p_id_67, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient67', 'patient67@benhvien.vn', '123456', N'Phạm Văn Long', @p_id_67, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240168', N'Bùi Ngọc Hà', '1972-05-26', N'Nữ', '711868543692', '0367131823', N'Hồ Chí Minh', 'GD479521316334');

DECLARE @p_id_68 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_68, 4, 4, DATEADD(day, -0, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240168', @p_id_68, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient68', 'patient68@benhvien.vn', '123456', N'Bùi Ngọc Hà', @p_id_68, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240169', N'Hoàng Quang Hà', '1987-10-23', N'Nữ', '511576544313', '0418615745', N'Hồ Chí Minh', 'GD479771591176');

DECLARE @p_id_69 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_69, 5, 5, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240169', @p_id_69, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient69', 'patient69@benhvien.vn', '123456', N'Hoàng Quang Hà', @p_id_69, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240170', N'Phan Minh Chi', '1976-05-07', N'Nam', '159658450285', '0347904243', N'Hồ Chí Minh', 'GD479224532417');

DECLARE @p_id_70 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_70, 1, 1, DATEADD(day, -9, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240170', @p_id_70, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient70', 'patient70@benhvien.vn', '123456', N'Phan Minh Chi', @p_id_70, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240171', N'Hoàng Ngọc Hà', '1969-03-01', N'Nam', '806616159112', '0269122717', N'Hồ Chí Minh', 'GD479407102056');

DECLARE @p_id_71 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_71, 2, 2, DATEADD(day, -1, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240171', @p_id_71, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient71', 'patient71@benhvien.vn', '123456', N'Hoàng Ngọc Hà', @p_id_71, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240172', N'Đặng Thanh Hùng', '1972-07-14', N'Nam', '156336576482', '0786210951', N'Hồ Chí Minh', 'GD479609676636');

DECLARE @p_id_72 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_72, 3, 3, DATEADD(day, -8, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240172', @p_id_72, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient72', 'patient72@benhvien.vn', '123456', N'Đặng Thanh Hùng', @p_id_72, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240173', N'Vũ Ngọc Cường', '2007-04-13', N'Nữ', '196512009446', '0250773446', N'Hồ Chí Minh', 'GD479373593024');

DECLARE @p_id_73 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_73, 4, 4, DATEADD(day, -6, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240173', @p_id_73, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient73', 'patient73@benhvien.vn', '123456', N'Vũ Ngọc Cường', @p_id_73, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240174', N'Lê Thị Tú', '1985-12-04', N'Nữ', '855485603185', '0737807789', N'Hồ Chí Minh', 'GD479892312351');

DECLARE @p_id_74 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_74, 5, 5, DATEADD(day, -3, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240174', @p_id_74, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient74', 'patient74@benhvien.vn', '123456', N'Lê Thị Tú', @p_id_74, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240175', N'Phan Minh Hạnh', '2000-07-26', N'Nam', '243897859797', '0255500410', N'Hồ Chí Minh', 'GD479964654677');

DECLARE @p_id_75 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_75, 1, 1, DATEADD(day, -1, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240175', @p_id_75, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient75', 'patient75@benhvien.vn', '123456', N'Phan Minh Hạnh', @p_id_75, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240176', N'Vũ Anh Long', '1970-11-18', N'Nữ', '268798542182', '0109658814', N'Hồ Chí Minh', 'GD479381286898');

DECLARE @p_id_76 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_76, 2, 2, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240176', @p_id_76, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient76', 'patient76@benhvien.vn', '123456', N'Vũ Anh Long', @p_id_76, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240177', N'Nguyễn Văn Giang', '1995-10-04', N'Nam', '331630490465', '0295519661', N'Hồ Chí Minh', 'GD479820721702');

DECLARE @p_id_77 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_77, 3, 3, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240177', @p_id_77, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient77', 'patient77@benhvien.vn', '123456', N'Nguyễn Văn Giang', @p_id_77, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240178', N'Nguyễn Minh Hùng', '1984-07-07', N'Nữ', '104399222497', '0928047150', N'Hồ Chí Minh', 'GD479371199811');

DECLARE @p_id_78 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_78, 4, 4, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240178', @p_id_78, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient78', 'patient78@benhvien.vn', '123456', N'Nguyễn Minh Hùng', @p_id_78, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240179', N'Vũ Minh Mai', '1950-04-27', N'Nữ', '446527217767', '0692385840', N'Hồ Chí Minh', 'GD479690533218');

DECLARE @p_id_79 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_79, 5, 5, DATEADD(day, -9, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240179', @p_id_79, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient79', 'patient79@benhvien.vn', '123456', N'Vũ Minh Mai', @p_id_79, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240180', N'Nguyễn Anh Minh', '1951-10-11', N'Nam', '386610768161', '0478235176', N'Hồ Chí Minh', 'GD479229353666');

DECLARE @p_id_80 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_80, 1, 1, DATEADD(day, -7, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240180', @p_id_80, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient80', 'patient80@benhvien.vn', '123456', N'Nguyễn Anh Minh', @p_id_80, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240181', N'Vũ Hữu Bình', '1968-11-14', N'Nữ', '110945626518', '0630355217', N'Hồ Chí Minh', 'GD479868067538');

DECLARE @p_id_81 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_81, 2, 2, DATEADD(day, -3, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240181', @p_id_81, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient81', 'patient81@benhvien.vn', '123456', N'Vũ Hữu Bình', @p_id_81, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240182', N'Huỳnh Ngọc Mai', '1999-11-12', N'Nữ', '456856207617', '0273322334', N'Hồ Chí Minh', 'GD479864278618');

DECLARE @p_id_82 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_82, 3, 3, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240182', @p_id_82, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient82', 'patient82@benhvien.vn', '123456', N'Huỳnh Ngọc Mai', @p_id_82, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240183', N'Huỳnh Ngọc Cường', '1991-03-03', N'Nữ', '214505005094', '0568942483', N'Hồ Chí Minh', 'GD479806012919');

DECLARE @p_id_83 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_83, 4, 4, DATEADD(day, -5, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240183', @p_id_83, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient83', 'patient83@benhvien.vn', '123456', N'Huỳnh Ngọc Cường', @p_id_83, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240184', N'Vũ Anh Dũng', '2009-09-22', N'Nam', '182487523923', '0358501819', N'Hồ Chí Minh', 'GD479570726251');

DECLARE @p_id_84 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_84, 5, 5, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240184', @p_id_84, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient84', 'patient84@benhvien.vn', '123456', N'Vũ Anh Dũng', @p_id_84, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240185', N'Trần Quang Cường', '1972-01-11', N'Nữ', '242063464189', '0961237735', N'Hồ Chí Minh', 'GD479992910520');

DECLARE @p_id_85 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_85, 1, 1, DATEADD(day, -2, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240185', @p_id_85, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient85', 'patient85@benhvien.vn', '123456', N'Trần Quang Cường', @p_id_85, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240186', N'Bùi Thanh Cường', '1996-11-03', N'Nam', '300720856603', '0214874614', N'Hồ Chí Minh', 'GD479755785208');

DECLARE @p_id_86 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_86, 2, 2, DATEADD(day, -7, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240186', @p_id_86, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient86', 'patient86@benhvien.vn', '123456', N'Bùi Thanh Cường', @p_id_86, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240187', N'Trần Anh Bình', '1961-03-24', N'Nữ', '959774384485', '0678265436', N'Hồ Chí Minh', 'GD479470599074');

DECLARE @p_id_87 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_87, 3, 3, DATEADD(day, -9, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240187', @p_id_87, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient87', 'patient87@benhvien.vn', '123456', N'Trần Anh Bình', @p_id_87, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240188', N'Phan Thị Lan', '2006-01-18', N'Nữ', '988694534666', '0872228867', N'Hồ Chí Minh', 'GD479300483634');

DECLARE @p_id_88 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_88, 4, 4, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240188', @p_id_88, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient88', 'patient88@benhvien.vn', '123456', N'Phan Thị Lan', @p_id_88, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240189', N'Nguyễn Đức Dương', '1958-05-07', N'Nam', '623264320924', '0772038204', N'Hồ Chí Minh', 'GD479425378117');

DECLARE @p_id_89 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_89, 5, 5, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240189', @p_id_89, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient89', 'patient89@benhvien.vn', '123456', N'Nguyễn Đức Dương', @p_id_89, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240190', N'Bùi Thanh Nam', '2005-10-28', N'Nam', '801454406460', '0902416928', N'Hồ Chí Minh', 'GD479859629034');

DECLARE @p_id_90 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_90, 1, 1, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240190', @p_id_90, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient90', 'patient90@benhvien.vn', '123456', N'Bùi Thanh Nam', @p_id_90, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240191', N'Lê Anh Lan', '1991-09-20', N'Nam', '272269078255', '0932299158', N'Hồ Chí Minh', 'GD479408020461');

DECLARE @p_id_91 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_91, 2, 2, DATEADD(day, -7, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240191', @p_id_91, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient91', 'patient91@benhvien.vn', '123456', N'Lê Anh Lan', @p_id_91, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240192', N'Vũ Văn Lan', '1962-03-11', N'Nữ', '426104803597', '0611084379', N'Hồ Chí Minh', 'GD479235391014');

DECLARE @p_id_92 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_92, 3, 3, DATEADD(day, -9, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240192', @p_id_92, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient92', 'patient92@benhvien.vn', '123456', N'Vũ Văn Lan', @p_id_92, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240193', N'Bùi Đức An', '1975-04-13', N'Nam', '831398909451', '0334481917', N'Hồ Chí Minh', 'GD47981211033');

DECLARE @p_id_93 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_93, 4, 4, DATEADD(day, -8, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240193', @p_id_93, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient93', 'patient93@benhvien.vn', '123456', N'Bùi Đức An', @p_id_93, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240194', N'Nguyễn Kim Dũng', '1967-02-28', N'Nữ', '687935011285', '0513892550', N'Hồ Chí Minh', 'GD479696388528');

DECLARE @p_id_94 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_94, 5, 5, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240194', @p_id_94, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient94', 'patient94@benhvien.vn', '123456', N'Nguyễn Kim Dũng', @p_id_94, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240195', N'Đặng Anh Hà', '2001-12-12', N'Nam', '422744831602', '0541952976', N'Hồ Chí Minh', 'GD479796030989');

DECLARE @p_id_95 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_95, 1, 1, DATEADD(day, -9, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240195', @p_id_95, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient95', 'patient95@benhvien.vn', '123456', N'Đặng Anh Hà', @p_id_95, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240196', N'Phan Kim Bình', '1963-08-22', N'Nam', '896487512931', '0649231190', N'Hồ Chí Minh', 'GD479799399578');

DECLARE @p_id_96 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_96, 2, 2, DATEADD(day, -0, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240196', @p_id_96, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient96', 'patient96@benhvien.vn', '123456', N'Phan Kim Bình', @p_id_96, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240197', N'Vũ Văn Mai', '1985-04-06', N'Nữ', '300208156285', '0261850738', N'Hồ Chí Minh', 'GD479560766053');

DECLARE @p_id_97 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_97, 3, 3, DATEADD(day, -7, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240197', @p_id_97, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient97', 'patient97@benhvien.vn', '123456', N'Vũ Văn Mai', @p_id_97, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240198', N'Đặng Đức Long', '1990-02-09', N'Nam', '526953075414', '0282050004', N'Hồ Chí Minh', 'GD479551717255');

DECLARE @p_id_98 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_98, 4, 4, DATEADD(day, -1, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240198', @p_id_98, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient98', 'patient98@benhvien.vn', '123456', N'Đặng Đức Long', @p_id_98, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240199', N'Bùi Thị Long', '1968-01-21', N'Nữ', '332935686363', '0900935449', N'Hồ Chí Minh', 'GD479926374146');

DECLARE @p_id_99 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_99, 5, 5, DATEADD(day, -1, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240199', @p_id_99, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient99', 'patient99@benhvien.vn', '123456', N'Bùi Thị Long', @p_id_99, N'Hoạt động');

INSERT INTO Patients (patient_code, full_name, date_of_birth, gender, identity_number, phone, address, health_insurance_no)
VALUES ('BN240200', N'Huỳnh Minh Linh', '1964-09-24', N'Nữ', '583043623655', '0706818240', N'Hồ Chí Minh', 'GD479942072967');

DECLARE @p_id_100 INT = SCOPE_IDENTITY();

INSERT INTO Admissions (patient_id, department_id, doctor_id, admission_date, initial_diagnosis, initial_condition, status, priority_level)
VALUES (@p_id_100, 1, 1, DATEADD(day, -4, GETDATE()), N'Theo dõi sức khỏe', N'Ổn định', N'Đang điều trị', N'Trung bình');

INSERT INTO MedicalRecords (record_code, patient_id, admission_id, diagnosis_on_admission, medical_history, allergies, vital_signs, doctor_notes, status)
VALUES ('HSBN240200', @p_id_100, SCOPE_IDENTITY(), N'Theo dõi sức khỏe', N'Chưa ghi nhận', N'Chưa ghi nhận', N'Mạch: 80; Huyết áp: 120/80', N'Cần theo dõi thêm', N'Đang điều trị');

INSERT INTO Users (role_id, username, email, password_hash, full_name, patient_id, status)
VALUES (@PatientRoleId, 'patient100', 'patient100@benhvien.vn', '123456', N'Huỳnh Minh Linh', @p_id_100, N'Hoạt động');
