USE QuanLyKhamChuaBenhNoiTru;
GO

IF OBJECT_ID(N'MedicineCatalog', N'U') IS NULL
BEGIN
  CREATE TABLE MedicineCatalog (
    medicine_id INT IDENTITY(1,1) PRIMARY KEY,
    medicine_code VARCHAR(30) NOT NULL UNIQUE,
    medicine_name NVARCHAR(180) NOT NULL,
    active_ingredient NVARCHAR(180),
    medicine_group NVARCHAR(150) NOT NULL,
    dosage_form NVARCHAR(100) NOT NULL,
    strength NVARCHAR(80),
    route NVARCHAR(80),
    unit NVARCHAR(50) NOT NULL DEFAULT N'viên',
    unit_price DECIMAL(18,2) NOT NULL DEFAULT 0,
    stock_warning_level INT NOT NULL DEFAULT 20,
    usage_note NVARCHAR(1000),
    contraindications NVARCHAR(1000),
    status NVARCHAR(30) NOT NULL DEFAULT N'Đang sử dụng',
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2
  );
END;
GO

IF OBJECT_ID(N'ServiceCatalog', N'U') IS NULL
BEGIN
  CREATE TABLE ServiceCatalog (
    service_id INT IDENTITY(1,1) PRIMARY KEY,
    service_code VARCHAR(30) NOT NULL UNIQUE,
    service_name NVARCHAR(180) NOT NULL,
    service_group NVARCHAR(150) NOT NULL,
    department_name NVARCHAR(150),
    unit NVARCHAR(50) NOT NULL DEFAULT N'lần',
    unit_price DECIMAL(18,2) NOT NULL DEFAULT 0,
    insurance_rate INT NOT NULL DEFAULT 0,
    turnaround_time NVARCHAR(100),
    description NVARCHAR(1000),
    status NVARCHAR(30) NOT NULL DEFAULT N'Đang sử dụng',
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2
  );
END;
GO
