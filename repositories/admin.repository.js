const { query, execute } = require('./base.repository');

async function ensureRoleModulePermissionsTable() {
  await execute(`
    IF OBJECT_ID('RoleModulePermissions', 'U') IS NULL
    BEGIN
      CREATE TABLE RoleModulePermissions (
        permission_id INT IDENTITY(1,1) PRIMARY KEY,
        module_key VARCHAR(100) NOT NULL,
        role_code VARCHAR(30) NOT NULL,
        allowed BIT NOT NULL CONSTRAINT DF_RoleModulePermissions_allowed DEFAULT 0,
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_RoleModulePermissions_updated_at DEFAULT SYSDATETIME(),
        CONSTRAINT UQ_RoleModulePermissions UNIQUE (module_key, role_code)
      );
    END;
  `);
}

async function syncModulePermissions(modules, roles) {
  await ensureRoleModulePermissionsTable();

  for (const item of modules) {
    for (const role of roles) {
      const defaultAllowed = role.roleCode === 'ADMIN' || (item.roles || []).includes(role.roleCode);
      await execute(`
        IF NOT EXISTS (
          SELECT 1
          FROM RoleModulePermissions
          WHERE module_key = @moduleKey AND role_code = @roleCode
        )
        BEGIN
          INSERT INTO RoleModulePermissions (module_key, role_code, allowed)
          VALUES (@moduleKey, @roleCode, @allowed);
        END;
      `, {
        moduleKey: item.key,
        roleCode: role.roleCode,
        allowed: defaultAllowed ? 1 : 0
      });
    }
  }
}

async function getModulePermissionMatrix(modules, roles) {
  await syncModulePermissions(modules, roles);

  const rows = await query(`
    SELECT module_key AS moduleKey, role_code AS roleCode, allowed
    FROM RoleModulePermissions
  `);

  const matrix = {};
  modules.forEach((item) => {
    matrix[item.key] = {};
    roles.forEach((role) => {
      matrix[item.key][role.roleCode] = role.roleCode === 'ADMIN';
    });
  });

  rows.forEach((row) => {
    if (!matrix[row.moduleKey]) matrix[row.moduleKey] = {};
    matrix[row.moduleKey][row.roleCode] = Boolean(row.allowed);
  });

  roles
    .filter((role) => role.roleCode === 'ADMIN')
    .forEach((role) => {
      modules.forEach((item) => {
        matrix[item.key][role.roleCode] = true;
      });
    });

  return matrix;
}

async function updateModulePermissions(modules, roles, allowedPairs = []) {
  await syncModulePermissions(modules, roles);

  const allowedSet = new Set(Array.isArray(allowedPairs) ? allowedPairs : [allowedPairs].filter(Boolean));
  const editableRoles = roles.filter((role) => role.roleCode !== 'ADMIN');

  for (const item of modules) {
    for (const role of editableRoles) {
      const allowed = allowedSet.has(`${item.key}::${role.roleCode}`);
      await execute(`
        UPDATE RoleModulePermissions
        SET allowed = @allowed,
            updated_at = SYSDATETIME()
        WHERE module_key = @moduleKey AND role_code = @roleCode;
      `, {
        moduleKey: item.key,
        roleCode: role.roleCode,
        allowed: allowed ? 1 : 0
      });
    }
  }

  await execute(`
    UPDATE RoleModulePermissions
    SET allowed = 1,
        updated_at = SYSDATETIME()
    WHERE role_code = 'ADMIN';
  `);
}

async function getRolesWithUserCounts() {
  return query(`
    SELECT r.role_id AS roleId, r.role_code AS roleCode, r.role_name AS roleName,
      r.description, COUNT(u.user_id) AS userCount
    FROM Roles r
    LEFT JOIN Users u ON u.role_id = r.role_id
    GROUP BY r.role_id, r.role_code, r.role_name, r.description
    ORDER BY r.role_id
  `);
}

async function createRole(data) {
  await execute(`
    INSERT INTO Roles (role_code, role_name, description)
    VALUES (@roleCode, @roleName, @description)
  `, {
    roleCode: data.roleCode,
    roleName: data.roleName,
    description: data.description || ''
  });
}

async function updateRole(roleId, data) {
  await execute(`
    UPDATE Roles
    SET role_code = @roleCode,
        role_name = @roleName,
        description = @description
    WHERE role_id = @roleId
  `, {
    roleId: Number(roleId),
    roleCode: data.roleCode,
    roleName: data.roleName,
    description: data.description
  });
}

async function deleteRole(roleId) {
  // Check for users before deleting
  const users = await query(`SELECT COUNT(*) as count FROM Users WHERE role_id = @roleId`, { roleId: Number(roleId) });
  if (users[0].count > 0) {
    throw new Error('Không thể xóa role đang có người dùng.');
  }
  await execute(`DELETE FROM Roles WHERE role_id = @roleId`, { roleId: Number(roleId) });
}

async function getSystemCounts() {
  const rows = await query(`
    SELECT 'users' AS metricKey, COUNT(*) AS metricValue FROM Users
    UNION ALL SELECT 'roles', COUNT(*) FROM Roles
    UNION ALL SELECT 'departments', COUNT(*) FROM Departments
    UNION ALL SELECT 'doctors', COUNT(*) FROM Doctors
    UNION ALL SELECT 'patients', COUNT(*) FROM Patients
    UNION ALL SELECT 'admissions', COUNT(*) FROM Admissions
    UNION ALL SELECT 'medicalRecords', COUNT(*) FROM MedicalRecords
    UNION ALL SELECT 'labTests', COUNT(*) FROM LabTests
    UNION ALL SELECT 'billingRows', COUNT(*) FROM Billing
  `);

  return rows.reduce((map, row) => {
    map[row.metricKey] = Number(row.metricValue || 0);
    return map;
  }, {});
}

async function getAuditEvents() {
  return query(`
    SELECT TOP 200 *
    FROM (
      SELECT u.created_at AS eventTime, N'Người dùng' AS sourceName,
        CONCAT(N'Tạo tài khoản ', u.username) AS eventTitle,
        CONCAT(u.full_name, N' · ', r.role_name, N' · ', u.status) AS eventDetail
      FROM Users u
      INNER JOIN Roles r ON r.role_id = u.role_id

      UNION ALL

      SELECT a.created_at AS eventTime, N'Nhập viện' AS sourceName,
        CONCAT(N'Tiếp nhận ', p.patient_code) AS eventTitle,
        CONCAT(p.full_name, N' · ', a.status, N' · ', d.department_name) AS eventDetail
      FROM Admissions a
      INNER JOIN Patients p ON p.patient_id = a.patient_id
      INNER JOIN Departments d ON d.department_id = a.department_id

      UNION ALL

      SELECT lt.ordered_date AS eventTime, N'Cận lâm sàng' AS sourceName,
        CONCAT(N'Chỉ định ', lt.test_code) AS eventTitle,
        CONCAT(p.full_name, N' · ', lt.test_type, N' · ', lt.status) AS eventDetail
      FROM LabTests lt
      INNER JOIN MedicalRecords mr ON mr.record_id = lt.record_id
      INNER JOIN Patients p ON p.patient_id = mr.patient_id

      UNION ALL

      SELECT b.created_at AS eventTime, N'Viện phí' AS sourceName,
        CONCAT(N'Lập hóa đơn ', b.bill_code) AS eventTitle,
        CONCAT(p.full_name, N' · ', FORMAT(b.total_amount, 'N0'), N' VND · ', b.payment_status) AS eventDetail
      FROM Billing b
      INNER JOIN Admissions a ON a.admission_id = b.admission_id
      INNER JOIN Patients p ON p.patient_id = a.patient_id

      UNION ALL

      SELECT n.created_at AS eventTime, N'Thông báo' AS sourceName,
        n.title AS eventTitle,
        CONCAT(n.type, N' · ', CASE WHEN n.is_read = 1 THEN N'Đã đọc' ELSE N'Chưa đọc' END) AS eventDetail
      FROM Notifications n
    ) events
    WHERE eventTime IS NOT NULL
    ORDER BY eventTime DESC
  `);
}

async function getRealtimeMetrics() {
  const rows = await query(`
    SELECT 'activeUsers' AS metricKey, COUNT(*) AS metricValue FROM Users WHERE status = N'Hoạt động'
    UNION ALL SELECT 'activeAdmissions', COUNT(*) FROM Admissions WHERE status IN (N'Đang điều trị', N'Theo dõi', N'Ổn định', N'Chờ xuất viện')
    UNION ALL SELECT 'pendingLabs', COUNT(*) FROM LabTests WHERE status <> N'Đã có kết quả'
    UNION ALL SELECT 'usedBeds', COUNT(*) FROM Beds WHERE status = N'Đang sử dụng'
    UNION ALL SELECT 'totalBeds', COUNT(*) FROM Beds
    UNION ALL SELECT 'unpaidBills', COUNT(*) FROM Billing WHERE payment_status <> N'Đã thanh toán'
  `);

  const metrics = rows.reduce((map, row) => {
    map[row.metricKey] = Number(row.metricValue || 0);
    return map;
  }, {});

  const dbTimeRows = await query(`SELECT SYSDATETIME() AS databaseTime, DB_NAME() AS databaseName`);
  return {
    ...metrics,
    databaseTime: dbTimeRows[0]?.databaseTime,
    databaseName: dbTimeRows[0]?.databaseName
  };
}

async function getIntegrationSignals() {
  const rows = await query(`
    SELECT 'LIS' AS systemCode, COUNT(*) AS totalEvents, MAX(ordered_date) AS lastEventAt
    FROM LabTests
    UNION ALL
    SELECT 'PACS', COUNT(*), MAX(ordered_date)
    FROM LabTests
    WHERE test_type LIKE N'%X-quang%' OR test_type LIKE N'%CT%' OR test_type LIKE N'%MRI%' OR test_type LIKE N'%siêu âm%'
    UNION ALL
    SELECT 'HIS', COUNT(*), MAX(created_at)
    FROM Admissions
  `);

  return rows.map((row) => ({
    ...row,
    totalEvents: Number(row.totalEvents || 0)
  }));
}

async function getStaffDirectory() {
  const doctors = await query(`
    SELECT d.doctor_id AS staffId, d.doctor_code AS staffCode, d.full_name AS fullName,
      d.specialty AS specialty, dept.department_name AS departmentName,
      d.shift_name AS shiftName, d.status,
      N'DOCTOR' AS staffType, d.email, d.phone
    FROM Doctors d
    LEFT JOIN Departments dept ON dept.department_id = d.department_id
    ORDER BY dept.department_name, d.full_name
  `);

  const users = await query(`
    SELECT u.user_id AS staffId, u.username AS staffCode, u.full_name AS fullName,
      r.role_name AS specialty, NULL AS departmentName,
      NULL AS shiftName, u.status,
      r.role_code AS staffType, u.email, NULL AS phone
    FROM Users u
    INNER JOIN Roles r ON r.role_id = u.role_id
    WHERE r.role_code <> 'PATIENT'
    ORDER BY r.role_code, u.full_name
  `);

  return { doctors, users };
}

module.exports = {
  getRolesWithUserCounts,
  getModulePermissionMatrix,
  updateModulePermissions,
  getSystemCounts,
  getAuditEvents,
  getRealtimeMetrics,
  getIntegrationSignals,
  getStaffDirectory
};
