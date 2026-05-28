IF NOT EXISTS (SELECT 1 FROM Roles WHERE role_code = 'PHARMACY')
BEGIN
  INSERT INTO Roles (role_code, role_name, description)
  VALUES (
    'PHARMACY',
    N'Dược',
    N'Kiểm tra tồn kho, cấp phát thuốc và vật tư, ghi nhận hoàn trả hoặc hủy thuốc nếu có'
  );
END;

IF NOT EXISTS (SELECT 1 FROM Users WHERE username = 'duoc')
BEGIN
  INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
  SELECT role_id, 'duoc', 'duoc@benhvien.vn', '123456', N'Nhân viên Dược', N'Hoạt động'
  FROM Roles
  WHERE role_code = 'PHARMACY';
END;

IF OBJECT_ID(N'RoleModulePermissions', N'U') IS NOT NULL
BEGIN
  DECLARE @PharmacyModules TABLE (module_key VARCHAR(100) PRIMARY KEY);

  INSERT INTO @PharmacyModules (module_key)
  VALUES
    ('pharmacy-medicine-catalog'),
    ('pharmacy-ward-meds'),
    ('pharmacy-supplies'),
    ('pharmacy-report-medicines'),
    ('catalog-medicines'),
    ('nurse-meds'),
    ('nurse-supplies'),
    ('report-medicines'),
    ('report-statistics');

  MERGE RoleModulePermissions AS target
  USING (
    SELECT module_key, 'PHARMACY' AS role_code, CAST(1 AS bit) AS allowed
    FROM @PharmacyModules
  ) AS source
  ON target.module_key = source.module_key
    AND target.role_code = source.role_code
  WHEN MATCHED THEN
    UPDATE SET allowed = source.allowed
  WHEN NOT MATCHED THEN
    INSERT (module_key, role_code, allowed)
    VALUES (source.module_key, source.role_code, source.allowed);
END;
