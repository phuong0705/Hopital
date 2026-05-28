USE QuanLyKhamChuaBenhNoiTru;
GO

IF OBJECT_ID(N'dbo.InpatientReceipts', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.InpatientReceipts (
    receipt_id INT IDENTITY(1,1) PRIMARY KEY,
    receipt_code VARCHAR(40) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    admission_id INT NOT NULL,
    record_id INT NULL,
    cashier_user_id INT NOT NULL,
    total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    payment_method NVARCHAR(80) NOT NULL DEFAULT N'Tiền mặt',
    payment_status NVARCHAR(50) NOT NULL DEFAULT N'Chưa thanh toán',
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_InpatientReceipts_Patients FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    CONSTRAINT FK_InpatientReceipts_Admissions FOREIGN KEY (admission_id) REFERENCES Admissions(admission_id),
    CONSTRAINT FK_InpatientReceipts_MedicalRecords FOREIGN KEY (record_id) REFERENCES MedicalRecords(record_id),
    CONSTRAINT FK_InpatientReceipts_Users FOREIGN KEY (cashier_user_id) REFERENCES Users(user_id)
  );
END;
GO

IF OBJECT_ID(N'dbo.TreatmentCosts', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.TreatmentCosts (
    cost_id INT IDENTITY(1,1) PRIMARY KEY,
    admission_id INT NOT NULL,
    record_id INT NOT NULL,
    source_type NVARCHAR(50) NOT NULL,
    source_id INT NULL,
    source_code VARCHAR(60) NULL,
    incurred_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    cost_type NVARCHAR(80) NOT NULL,
    content NVARCHAR(250) NOT NULL,
    department_name NVARCHAR(150),
    recorded_by NVARCHAR(150),
    quantity DECIMAL(18,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(18,2) NOT NULL DEFAULT 0,
    amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    status NVARCHAR(50) NOT NULL DEFAULT N'Chờ thực hiện',
    receipt_id INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NULL,
    CONSTRAINT FK_TreatmentCosts_Admissions FOREIGN KEY (admission_id) REFERENCES Admissions(admission_id),
    CONSTRAINT FK_TreatmentCosts_MedicalRecords FOREIGN KEY (record_id) REFERENCES MedicalRecords(record_id),
    CONSTRAINT FK_TreatmentCosts_Receipts FOREIGN KEY (receipt_id) REFERENCES InpatientReceipts(receipt_id)
  );
END;
GO

IF OBJECT_ID(N'dbo.InpatientReceiptItems', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.InpatientReceiptItems (
    receipt_item_id INT IDENTITY(1,1) PRIMARY KEY,
    receipt_id INT NOT NULL,
    cost_id INT NOT NULL,
    CONSTRAINT FK_InpatientReceiptItems_Receipts FOREIGN KEY (receipt_id) REFERENCES InpatientReceipts(receipt_id),
    CONSTRAINT FK_InpatientReceiptItems_Costs FOREIGN KEY (cost_id) REFERENCES TreatmentCosts(cost_id)
  );
END;
GO

IF OBJECT_ID(N'dbo.ServiceCatalog', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.ServiceCatalog (
    service_id INT IDENTITY(1,1) PRIMARY KEY,
    service_code VARCHAR(30) NOT NULL UNIQUE,
    service_name NVARCHAR(180) NOT NULL,
    service_group NVARCHAR(150) NOT NULL,
    department_name NVARCHAR(150),
    unit NVARCHAR(50) NOT NULL DEFAULT N'lần',
    unit_price DECIMAL(18,2) NOT NULL DEFAULT 0,
    insurance_rate INT NOT NULL DEFAULT 0,
    status NVARCHAR(30) NOT NULL DEFAULT N'Đang sử dụng',
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
  );
END;
GO

MERGE ServiceCatalog AS target
USING (
  SELECT 'DV000' AS service_code, N'Phí tiếp nhận nội trú' AS service_name,
    N'Nhập viện' AS service_group, CAST(NULL AS NVARCHAR(150)) AS department_name,
    N'lần' AS unit, CAST(150000 AS DECIMAL(18,2)) AS unit_price
  UNION ALL
  SELECT 'DV002', N'Ngày giường nội trú thường', N'Giường bệnh', NULL, N'ngày', CAST(300000 AS DECIMAL(18,2))
  UNION ALL
  SELECT 'DV003', N'Ngày giường hồi sức cấp cứu', N'Giường bệnh', NULL, N'ngày', CAST(750000 AS DECIMAL(18,2))
) AS src
ON target.service_code = src.service_code
WHEN NOT MATCHED THEN
  INSERT (service_code, service_name, service_group, department_name, unit, unit_price, insurance_rate, status)
  VALUES (src.service_code, src.service_name, src.service_group, src.department_name, src.unit, src.unit_price, 0, N'Đang sử dụng');
GO
