USE QuanLyKhamChuaBenhNoiTru;
GO

IF COL_LENGTH('LabTests', 'result_note') IS NULL
BEGIN
  ALTER TABLE LabTests
  ADD result_note NVARCHAR(1000) NULL;
END
GO
