/*
  Additional read-optimization indexes for cached lookup/report paths.
  Safe to run multiple times.
*/

IF OBJECT_ID(N'dbo.Departments', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Departments_Status_Name' AND object_id = OBJECT_ID(N'dbo.Departments'))
  CREATE INDEX IX_Departments_Status_Name
  ON dbo.Departments(status, department_name)
  INCLUDE (department_code);

IF OBJECT_ID(N'dbo.Doctors', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Doctors_Status_Name' AND object_id = OBJECT_ID(N'dbo.Doctors'))
  CREATE INDEX IX_Doctors_Status_Name
  ON dbo.Doctors(status, full_name)
  INCLUDE (doctor_code, specialty, department_id, shift_name);

IF OBJECT_ID(N'dbo.ServiceCatalog', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ServiceCatalog_Status_Group_Name' AND object_id = OBJECT_ID(N'dbo.ServiceCatalog'))
  CREATE INDEX IX_ServiceCatalog_Status_Group_Name
  ON dbo.ServiceCatalog(status, service_group, service_name)
  INCLUDE (service_code, department_name, unit_price, insurance_rate);

IF OBJECT_ID(N'dbo.InpatientReceipts', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_InpatientReceipts_Created_Admission' AND object_id = OBJECT_ID(N'dbo.InpatientReceipts'))
  CREATE INDEX IX_InpatientReceipts_Created_Admission
  ON dbo.InpatientReceipts(created_at DESC, admission_id)
  INCLUDE (paid_amount, insurance_covered);

IF OBJECT_ID(N'dbo.Prescriptions', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Prescriptions_Doctor_Record' AND object_id = OBJECT_ID(N'dbo.Prescriptions'))
  CREATE INDEX IX_Prescriptions_Doctor_Record
  ON dbo.Prescriptions(doctor_id, record_id)
  INCLUDE (prescription_id);

IF OBJECT_ID(N'dbo.MedicineCatalog', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_MedicineCatalog_Name_Status' AND object_id = OBJECT_ID(N'dbo.MedicineCatalog'))
  CREATE INDEX IX_MedicineCatalog_Name_Status
  ON dbo.MedicineCatalog(medicine_name, status)
  INCLUDE (medicine_code, active_ingredient, unit);
