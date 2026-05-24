USE QuanLyKhamChuaBenhNoiTru;
GO

IF COL_LENGTH('LabTests', 'result_files') IS NULL
BEGIN
  ALTER TABLE LabTests
  ADD result_files NVARCHAR(MAX) NULL;
END
GO
