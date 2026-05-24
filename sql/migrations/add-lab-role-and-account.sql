USE QuanLyKhamChuaBenhNoiTru;
GO

IF NOT EXISTS (SELECT 1 FROM Roles WHERE role_code = 'LAB')
BEGIN
  INSERT INTO Roles (role_code, role_name, description)
  VALUES ('LAB', N'Viện xét nghiệm', N'Tiếp nhận chỉ định xét nghiệm và cập nhật kết quả xét nghiệm');
END
GO

DECLARE @LabRoleId INT = (SELECT role_id FROM Roles WHERE role_code = 'LAB');

IF NOT EXISTS (SELECT 1 FROM Users WHERE username = 'vienxetnghiem')
BEGIN
  INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
  VALUES (
    @LabRoleId,
    'vienxetnghiem',
    'vienxetnghiem@benhvien.vn',
    '123456',
    N'Viện xét nghiệm trung tâm',
    N'Hoạt động'
  );
END
ELSE
BEGIN
  UPDATE Users
  SET role_id = @LabRoleId,
      password_hash = '123456',
      full_name = N'Viện xét nghiệm trung tâm',
      status = N'Hoạt động',
      updated_at = SYSDATETIME()
  WHERE username = 'vienxetnghiem';
END
GO

IF OBJECT_ID('RoleModulePermissions', 'U') IS NOT NULL
BEGIN
  MERGE RoleModulePermissions AS target
  USING (
    SELECT 'labtests-order' AS module_key, 'LAB' AS role_code, CAST(1 AS BIT) AS allowed
    UNION ALL SELECT 'lab-summary', 'LAB', CAST(1 AS BIT)
  ) AS source
    ON target.module_key = source.module_key
   AND target.role_code = source.role_code
  WHEN MATCHED THEN
    UPDATE SET allowed = source.allowed, updated_at = SYSDATETIME()
  WHEN NOT MATCHED THEN
    INSERT (module_key, role_code, allowed)
    VALUES (source.module_key, source.role_code, source.allowed);
END
GO
