/*
  Performance indexes for common HIS screens and reports.
  Safe to run multiple times.
*/

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Users_Role_Status' AND object_id = OBJECT_ID(N'dbo.Users'))
  CREATE INDEX IX_Users_Role_Status ON dbo.Users(role_id, status) INCLUDE (username, email, full_name, patient_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Users_Patient' AND object_id = OBJECT_ID(N'dbo.Users'))
  CREATE INDEX IX_Users_Patient ON dbo.Users(patient_id) WHERE patient_id IS NOT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Patients_Search' AND object_id = OBJECT_ID(N'dbo.Patients'))
  CREATE INDEX IX_Patients_Search ON dbo.Patients(patient_code, identity_number, phone) INCLUDE (full_name, date_of_birth, gender, created_at);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Patients_CreatedAt' AND object_id = OBJECT_ID(N'dbo.Patients'))
  CREATE INDEX IX_Patients_CreatedAt ON dbo.Patients(created_at DESC) INCLUDE (patient_code, full_name, phone);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Doctors_Department_Status' AND object_id = OBJECT_ID(N'dbo.Doctors'))
  CREATE INDEX IX_Doctors_Department_Status ON dbo.Doctors(department_id, status) INCLUDE (full_name, specialty, shift_name);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Rooms_Department_Status' AND object_id = OBJECT_ID(N'dbo.Rooms'))
  CREATE INDEX IX_Rooms_Department_Status ON dbo.Rooms(department_id, status) INCLUDE (room_code, room_name, floor_no);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Beds_Room_Status' AND object_id = OBJECT_ID(N'dbo.Beds'))
  CREATE INDEX IX_Beds_Room_Status ON dbo.Beds(room_id, status) INCLUDE (bed_code);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Admissions_Patient_Date' AND object_id = OBJECT_ID(N'dbo.Admissions'))
  CREATE INDEX IX_Admissions_Patient_Date ON dbo.Admissions(patient_id, admission_date DESC) INCLUDE (status, department_id, doctor_id, room_id, bed_id, priority_level);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Admissions_Doctor_Status_Date' AND object_id = OBJECT_ID(N'dbo.Admissions'))
  CREATE INDEX IX_Admissions_Doctor_Status_Date ON dbo.Admissions(doctor_id, status, admission_date DESC) INCLUDE (patient_id, department_id, room_id, bed_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Admissions_Department_Status_Date' AND object_id = OBJECT_ID(N'dbo.Admissions'))
  CREATE INDEX IX_Admissions_Department_Status_Date ON dbo.Admissions(department_id, status, admission_date DESC) INCLUDE (patient_id, doctor_id, room_id, bed_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Admissions_Bed_Active' AND object_id = OBJECT_ID(N'dbo.Admissions'))
  CREATE INDEX IX_Admissions_Bed_Active ON dbo.Admissions(bed_id, status) INCLUDE (admission_id, patient_id)
  WHERE bed_id IS NOT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_MedicalRecords_Admission' AND object_id = OBJECT_ID(N'dbo.MedicalRecords'))
  CREATE INDEX IX_MedicalRecords_Admission ON dbo.MedicalRecords(admission_id) INCLUDE (record_id, record_code, patient_id, status, updated_at);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_MedicalRecords_Patient_Status' AND object_id = OBJECT_ID(N'dbo.MedicalRecords'))
  CREATE INDEX IX_MedicalRecords_Patient_Status ON dbo.MedicalRecords(patient_id, status, created_at DESC) INCLUDE (record_id, admission_id, record_code);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_TreatmentSchedules_Record_Time' AND object_id = OBJECT_ID(N'dbo.TreatmentSchedules'))
  CREATE INDEX IX_TreatmentSchedules_Record_Time ON dbo.TreatmentSchedules(record_id, scheduled_time DESC) INCLUDE (status, assignee_name);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Prescriptions_Record_Start' AND object_id = OBJECT_ID(N'dbo.Prescriptions'))
  CREATE INDEX IX_Prescriptions_Record_Start ON dbo.Prescriptions(record_id, start_date DESC) INCLUDE (doctor_id, end_date, prescription_code);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_PrescriptionItems_Prescription' AND object_id = OBJECT_ID(N'dbo.PrescriptionItems'))
  CREATE INDEX IX_PrescriptionItems_Prescription ON dbo.PrescriptionItems(prescription_id) INCLUDE (medicine_name, quantity, unit);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_LabTests_Record_Date' AND object_id = OBJECT_ID(N'dbo.LabTests'))
  CREATE INDEX IX_LabTests_Record_Date ON dbo.LabTests(record_id, ordered_date DESC) INCLUDE (doctor_id, status, test_type, test_code);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_LabTests_Doctor_Status' AND object_id = OBJECT_ID(N'dbo.LabTests'))
  CREATE INDEX IX_LabTests_Doctor_Status ON dbo.LabTests(doctor_id, status, ordered_date DESC) INCLUDE (record_id, test_type, test_code);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Billing_Admission' AND object_id = OBJECT_ID(N'dbo.Billing'))
  CREATE INDEX IX_Billing_Admission ON dbo.Billing(admission_id) INCLUDE (billing_id, bill_code, total_amount, payment_status, created_at);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Billing_Status_CreatedAt' AND object_id = OBJECT_ID(N'dbo.Billing'))
  CREATE INDEX IX_Billing_Status_CreatedAt ON dbo.Billing(payment_status, created_at DESC) INCLUDE (admission_id, total_amount, insurance_covered);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_BillingItems_Billing' AND object_id = OBJECT_ID(N'dbo.BillingItems'))
  CREATE INDEX IX_BillingItems_Billing ON dbo.BillingItems(billing_id) INCLUDE (item_type, amount);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Discharges_Admission_Date' AND object_id = OBJECT_ID(N'dbo.Discharges'))
  CREATE INDEX IX_Discharges_Admission_Date ON dbo.Discharges(admission_id, discharge_date DESC) INCLUDE (payment_status, total_cost);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Notifications_User_Read_CreatedAt' AND object_id = OBJECT_ID(N'dbo.Notifications'))
  CREATE INDEX IX_Notifications_User_Read_CreatedAt ON dbo.Notifications(user_id, is_read, created_at DESC) INCLUDE (title, type);

IF OBJECT_ID(N'dbo.Appointments', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Appointments_Doctor_Status_Time' AND object_id = OBJECT_ID(N'dbo.Appointments'))
  CREATE INDEX IX_Appointments_Doctor_Status_Time ON dbo.Appointments(doctor_id, status, appointment_time) INCLUDE (patient_id, department_id, patient_name);

IF OBJECT_ID(N'dbo.Appointments', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Appointments_Patient_Time' AND object_id = OBJECT_ID(N'dbo.Appointments'))
  CREATE INDEX IX_Appointments_Patient_Time ON dbo.Appointments(patient_id, appointment_time DESC) INCLUDE (status, department_id, doctor_id);

IF OBJECT_ID(N'dbo.FollowUpBookings', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FollowUpBookings_Patient_Date' AND object_id = OBJECT_ID(N'dbo.FollowUpBookings'))
  CREATE INDEX IX_FollowUpBookings_Patient_Date ON dbo.FollowUpBookings(patient_id, requested_date DESC, requested_time DESC) INCLUDE (department_id, doctor_id, status);

IF OBJECT_ID(N'dbo.MedicineCatalog', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_MedicineCatalog_Status_Search' AND object_id = OBJECT_ID(N'dbo.MedicineCatalog'))
  CREATE INDEX IX_MedicineCatalog_Status_Search ON dbo.MedicineCatalog(status, medicine_code, medicine_name) INCLUDE (active_ingredient, current_stock, unit);

IF OBJECT_ID(N'dbo.MedicineInventoryHistory', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_MedicineInventoryHistory_Medicine_Date' AND object_id = OBJECT_ID(N'dbo.MedicineInventoryHistory'))
  CREATE INDEX IX_MedicineInventoryHistory_Medicine_Date ON dbo.MedicineInventoryHistory(medicine_id, transaction_date DESC) INCLUDE (transaction_type, quantity, performed_by);
