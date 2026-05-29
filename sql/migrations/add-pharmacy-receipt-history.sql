USE QuanLyKhamChuaBenhNoiTru;
GO

IF COL_LENGTH('MedicineInventoryHistory', 'receipt_code') IS NULL
BEGIN
  ALTER TABLE MedicineInventoryHistory
  ADD receipt_code VARCHAR(30) NULL;
END
GO

IF COL_LENGTH('MedicineInventoryHistory', 'warehouse_name') IS NULL
BEGIN
  ALTER TABLE MedicineInventoryHistory
  ADD warehouse_name NVARCHAR(150) NULL;
END
GO

IF COL_LENGTH('SupplyTransactions', 'receipt_code') IS NULL
BEGIN
  ALTER TABLE SupplyTransactions
  ADD receipt_code VARCHAR(30) NULL;
END
GO

IF COL_LENGTH('SupplyTransactions', 'warehouse_name') IS NULL
BEGIN
  ALTER TABLE SupplyTransactions
  ADD warehouse_name NVARCHAR(150) NULL;
END
GO
