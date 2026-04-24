USE QuanLyKhamChuaBenhNoiTru;
GO

IF OBJECT_ID(N'MedicineInventoryHistory', N'U') IS NULL
BEGIN
  CREATE TABLE MedicineInventoryHistory (
    history_id INT IDENTITY(1,1) PRIMARY KEY,
    medicine_id INT NOT NULL,
    transaction_type NVARCHAR(50) NOT NULL, -- 'Nhập kho', 'Xuất kho', 'Điều chỉnh'
    quantity INT NOT NULL,
    transaction_date DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    performed_by INT NULL,
    note NVARCHAR(500),
    CONSTRAINT FK_Inventory_Medicine FOREIGN KEY (medicine_id) REFERENCES MedicineCatalog(medicine_id),
    CONSTRAINT FK_Inventory_User FOREIGN KEY (performed_by) REFERENCES Users(user_id)
  );
END;
GO

-- Add stock column to MedicineCatalog if it doesn't exist
IF COL_LENGTH('MedicineCatalog', 'current_stock') IS NULL
BEGIN
  ALTER TABLE MedicineCatalog ADD current_stock INT NOT NULL DEFAULT 0;
END;
GO

-- Seed some initial history
IF NOT EXISTS (SELECT 1 FROM MedicineInventoryHistory)
BEGIN
  DECLARE @Med1 INT, @Med2 INT, @Med3 INT, @UserAdmin INT;
  SELECT TOP 1 @Med1 = medicine_id FROM MedicineCatalog WHERE medicine_code = 'TH001';
  SELECT TOP 1 @Med2 = medicine_id FROM MedicineCatalog WHERE medicine_code = 'TH002';
  SELECT TOP 1 @Med3 = medicine_id FROM MedicineCatalog WHERE medicine_code = 'TH003';
  SELECT TOP 1 @UserAdmin = user_id FROM Users WHERE username = 'admin';

  INSERT INTO MedicineInventoryHistory (medicine_id, transaction_type, quantity, transaction_date, performed_by, note)
  VALUES
  (@Med1, N'Nhập kho', 100, DATEADD(day, -5, SYSDATETIME()), @UserAdmin, N'Nhập kho định kỳ đầu tháng'),
  (@Med1, N'Xuất kho', 10, DATEADD(day, -3, SYSDATETIME()), @UserAdmin, N'Xuất cho khoa Nội'),
  (@Med2, N'Nhập kho', 500, DATEADD(day, -4, SYSDATETIME()), @UserAdmin, N'Nhập bổ sung'),
  (@Med3, N'Nhập kho', 50, DATEADD(day, -2, SYSDATETIME()), @UserAdmin, N'Nhập thuốc hiếm');

  UPDATE MedicineCatalog SET current_stock = 90 WHERE medicine_id = @Med1;
  UPDATE MedicineCatalog SET current_stock = 500 WHERE medicine_id = @Med2;
  UPDATE MedicineCatalog SET current_stock = 50 WHERE medicine_id = @Med3;
END;
GO
