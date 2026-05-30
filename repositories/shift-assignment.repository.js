const { query, execute } = require('./base.repository');

const SHIFT_STATUSES = ['Chờ thực hiện', 'Đang trực', 'Hoàn thành', 'Vắng mặt', 'Hủy ca'];

async function ensureShiftAssignmentTables() {
  await execute(`
    IF OBJECT_ID(N'shift_assignments', N'U') IS NULL
    BEGIN
      CREATE TABLE shift_assignments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        shift_code VARCHAR(40) NOT NULL UNIQUE,
        employee_type VARCHAR(20) NOT NULL,
        employee_id INT NOT NULL,
        department_id INT NOT NULL,
        work_date DATE NOT NULL,
        shift_name NVARCHAR(80) NOT NULL,
        start_time TIME(0) NOT NULL,
        end_time TIME(0) NOT NULL,
        status NVARCHAR(40) NOT NULL DEFAULT N'Chờ thực hiện',
        note NVARCHAR(500),
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at DATETIME2,
        CONSTRAINT FK_ShiftAssignments_Departments FOREIGN KEY (department_id) REFERENCES Departments(department_id)
      );
    END;
  `);
}

function normalizeEmployeeType(value) {
  return String(value || '').trim().toUpperCase() === 'DOCTOR' ? 'DOCTOR' : 'USER';
}

function normalizeStatus(value) {
  const status = String(value || '').trim();
  return status || 'Chờ thực hiện';
}

function parseEmployeeKey(value, fallbackType, fallbackId) {
  if (value && String(value).includes(':')) {
    const [type, id] = String(value).split(':');
    return {
      employeeType: normalizeEmployeeType(type),
      employeeId: Number(id)
    };
  }

  return {
    employeeType: normalizeEmployeeType(fallbackType),
    employeeId: Number(fallbackId)
  };
}

function getDateOnly(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(value || '').slice(0, 10);
}

function toMinutes(value) {
  const [hours, minutes] = String(value || '').split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  return (hours * 60) + minutes;
}

function toDayNumber(value) {
  const date = getDateOnly(value);
  const [year, month, day] = date.split('-').map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    throw new Error('Ngày làm việc không hợp lệ.');
  }
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

function addDays(value, days) {
  const dayNumber = toDayNumber(value) + days;
  return new Date(dayNumber * 86400000).toISOString().slice(0, 10);
}

function getShiftRange(workDate, startTime, endTime) {
  const start = toMinutes(startTime);
  let end = toMinutes(endTime);
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    throw new Error('Giờ bắt đầu hoặc giờ kết thúc không hợp lệ.');
  }
  if (start === end) {
    throw new Error('Giờ bắt đầu và giờ kết thúc không được trùng nhau.');
  }
  if (end < start) end += 24 * 60;
  const dayNumber = toDayNumber(workDate);
  return {
    date: getDateOnly(workDate),
    start,
    end,
    absoluteStart: (dayNumber * 24 * 60) + start,
    absoluteEnd: (dayNumber * 24 * 60) + end
  };
}

function hasOverlap(a, b) {
  return a.absoluteStart < b.absoluteEnd && b.absoluteStart < a.absoluteEnd;
}

async function getEmployees() {
  await ensureShiftAssignmentTables();

  const doctors = await query(`
    SELECT d.doctor_id AS employeeId, N'DOCTOR' AS employeeType,
      d.full_name AS fullName, d.doctor_code AS employeeCode,
      N'DOCTOR' AS roleCode,
      CONCAT(N'Bác sĩ', CASE WHEN NULLIF(d.specialty, '') IS NOT NULL THEN CONCAT(N' - ', d.specialty) ELSE N'' END) AS roleName,
      d.department_id AS departmentId,
      dept.department_name AS departmentName
    FROM Doctors d
    LEFT JOIN Departments dept ON dept.department_id = d.department_id
    WHERE d.status = N'Đang làm việc'
    ORDER BY d.full_name
  `);

  const users = await query(`
    SELECT u.user_id AS employeeId, N'USER' AS employeeType,
      u.full_name AS fullName, u.username AS employeeCode,
      r.role_code AS roleCode, r.role_name AS roleName, u.department_id AS departmentId,
      dept.department_name AS departmentName
    FROM Users u
    INNER JOIN Roles r ON r.role_id = u.role_id
    LEFT JOIN Departments dept ON dept.department_id = u.department_id
    WHERE u.status = N'Hoạt động'
      AND r.role_code <> 'PATIENT'
      AND r.role_code <> 'DOCTOR'
    ORDER BY u.full_name
  `);

  return [...doctors, ...users].map((row) => ({
    ...row,
    employeeKey: `${row.employeeType}:${row.employeeId}`
  }));
}

async function getDepartments() {
  await ensureShiftAssignmentTables();

  return query(`
    SELECT department_id AS departmentId, department_name AS departmentName
    FROM Departments
    WHERE status = N'Hoạt động'
    ORDER BY department_name
  `);
}

async function assertEmployeeExists(employeeType, employeeId) {
  const rows = employeeType === 'DOCTOR'
    ? await query('SELECT doctor_id AS employeeId FROM Doctors WHERE doctor_id = @employeeId', { employeeId })
    : await query('SELECT user_id AS employeeId FROM Users WHERE user_id = @employeeId', { employeeId });

  if (!rows.length) throw new Error('Nhân viên không tồn tại.');
}

async function assertDepartmentExists(departmentId) {
  const rows = await query('SELECT department_id AS departmentId FROM Departments WHERE department_id = @departmentId', { departmentId });
  if (!rows.length) throw new Error('Khoa/phòng không tồn tại.');
}

async function assertNoOverlap(data, ignoreId = null) {
  const currentRange = getShiftRange(data.workDate, data.startTime, data.endTime);
  const rows = await query(`
    SELECT id, work_date AS workDate,
      CONVERT(VARCHAR(5), start_time, 108) AS startTime,
      CONVERT(VARCHAR(5), end_time, 108) AS endTime
    FROM shift_assignments
    WHERE employee_type = @employeeType
      AND employee_id = @employeeId
      AND status <> N'Hủy ca'
      AND work_date BETWEEN @previousDate AND @nextDate
      ${ignoreId ? 'AND id <> @ignoreId' : ''}
  `, {
    employeeType: data.employeeType,
    employeeId: data.employeeId,
    previousDate: addDays(currentRange.date, -1),
    nextDate: addDays(currentRange.date, 1),
    ignoreId: Number(ignoreId)
  });

  const duplicated = rows.some((row) => hasOverlap(currentRange, getShiftRange(row.workDate, row.startTime, row.endTime)));
  if (duplicated) {
    throw new Error('Nhân viên đã có phân ca trùng thời gian.');
  }
}

async function validateShiftPayload(data, options = {}) {
  if (!data.employeeId) throw new Error('Vui lòng chọn nhân viên.');
  if (!data.departmentId) throw new Error('Vui lòng chọn khoa/phòng.');
  if (!data.workDate) throw new Error('Ngày làm việc không được bỏ trống.');
  if (!data.shiftName) throw new Error('Vui lòng nhập ca làm việc.');
  if (!data.startTime || !data.endTime) throw new Error('Vui lòng nhập giờ bắt đầu và giờ kết thúc.');
  if (!SHIFT_STATUSES.includes(data.status)) throw new Error('Trạng thái phân ca không hợp lệ.');

  getShiftRange(data.workDate, data.startTime, data.endTime);
  await assertEmployeeExists(data.employeeType, data.employeeId);
  await assertDepartmentExists(data.departmentId);
  await assertNoOverlap(data, options.ignoreId);
}

async function getShiftAssignments(filters = {}) {
  await ensureShiftAssignmentTables();

  const params = {};
  const whereClauses = [];

  if (filters.departmentId) {
    whereClauses.push('sa.department_id = @departmentId');
    params.departmentId = Number(filters.departmentId);
  }

  if (filters.employeeKey) {
    const employee = parseEmployeeKey(filters.employeeKey);
    if (employee.employeeId) {
      whereClauses.push('sa.employee_type = @employeeType AND sa.employee_id = @employeeId');
      params.employeeType = employee.employeeType;
      params.employeeId = employee.employeeId;
    }
  }

  if (filters.workDate) {
    whereClauses.push('sa.work_date = @workDate');
    params.workDate = getDateOnly(filters.workDate);
  }

  if (filters.weekStart && filters.weekEnd) {
    whereClauses.push('sa.work_date BETWEEN @weekStart AND @weekEnd');
    params.weekStart = getDateOnly(filters.weekStart);
    params.weekEnd = getDateOnly(filters.weekEnd);
  }

  if (filters.shiftName) {
    whereClauses.push('sa.shift_name = @shiftName');
    params.shiftName = filters.shiftName;
  }

  if (filters.roleCode) {
    if (filters.roleCode === 'DOCTOR') {
      whereClauses.push(`sa.employee_type = 'DOCTOR'`);
    } else {
      whereClauses.push('role.role_code = @roleCode');
      params.roleCode = filters.roleCode;
    }
  }

  if (filters.status) {
    whereClauses.push('sa.status = @status');
    params.status = filters.status;
  }

  if (filters.q) {
    whereClauses.push(`(
      doctor.full_name LIKE @search
      OR appUser.full_name LIKE @search
      OR sa.shift_code LIKE @search
      OR sa.shift_name LIKE @search
    )`);
    params.search = `%${filters.q}%`;
  }

  if (filters.scopeEmployeeType && filters.scopeEmployeeId) {
    whereClauses.push('sa.employee_type = @scopeEmployeeType AND sa.employee_id = @scopeEmployeeId');
    params.scopeEmployeeType = filters.scopeEmployeeType;
    params.scopeEmployeeId = Number(filters.scopeEmployeeId);
  }

  if (filters.scopeDepartmentId) {
    whereClauses.push('sa.department_id = @scopeDepartmentId');
    params.scopeDepartmentId = Number(filters.scopeDepartmentId);
  }

  const whereClause = whereClauses.length ? `WHERE ${whereClauses.join('\n      AND ')}` : '';

  return query(`
    SELECT sa.id, sa.shift_code AS shiftCode,
      sa.employee_type AS employeeType,
      sa.employee_id AS employeeId,
      CONCAT(sa.employee_type, ':', sa.employee_id) AS employeeKey,
      COALESCE(doctor.full_name, appUser.full_name) AS employeeName,
      COALESCE(doctor.doctor_code, appUser.username) AS employeeCode,
      CASE WHEN doctor.doctor_id IS NOT NULL THEN 'DOCTOR' ELSE role.role_code END AS roleCode,
      COALESCE(
        CASE
          WHEN doctor.doctor_id IS NOT NULL
          THEN CONCAT(N'Bác sĩ', CASE WHEN NULLIF(doctor.specialty, '') IS NOT NULL THEN CONCAT(N' - ', doctor.specialty) ELSE N'' END)
        END,
        role.role_name,
        sa.employee_type
      ) AS positionName,
      sa.department_id AS departmentId,
      dept.department_name AS departmentName,
      sa.work_date AS workDate,
      sa.shift_name AS shiftName,
      CONVERT(VARCHAR(5), sa.start_time, 108) AS startTime,
      CONVERT(VARCHAR(5), sa.end_time, 108) AS endTime,
      sa.status, sa.note,
      sa.created_at AS createdAt,
      sa.updated_at AS updatedAt
    FROM shift_assignments sa
    INNER JOIN Departments dept ON dept.department_id = sa.department_id
    LEFT JOIN Doctors doctor ON sa.employee_type = 'DOCTOR' AND doctor.doctor_id = sa.employee_id
    LEFT JOIN Users appUser ON sa.employee_type = 'USER' AND appUser.user_id = sa.employee_id
    LEFT JOIN Roles role ON role.role_id = appUser.role_id
    ${whereClause}
    ORDER BY sa.work_date DESC, sa.start_time, sa.shift_code
  `, params);
}

async function getShiftAssignmentById(id) {
  const rows = await getShiftAssignments({});
  return rows.find((row) => Number(row.id) === Number(id));
}

async function generateShiftCode() {
  const rows = await query(`
    SELECT ISNULL(MAX(TRY_CONVERT(INT, SUBSTRING(shift_code, 3, 20))), 0) + 1 AS nextNumber
    FROM shift_assignments
  `);
  return `PC${String(rows[0]?.nextNumber || 1).padStart(6, '0')}`;
}

async function createShiftAssignment(payload) {
  await ensureShiftAssignmentTables();
  const employee = parseEmployeeKey(
    payload.employeeKey,
    payload.employeeType || payload.employee_type,
    payload.employeeId || payload.employee_id
  );
  const data = {
    employeeType: employee.employeeType,
    employeeId: employee.employeeId,
    departmentId: Number(payload.departmentId || payload.department_id),
    workDate: getDateOnly(payload.workDate || payload.work_date),
    shiftName: String(payload.shiftName || payload.shift_name || '').trim(),
    startTime: payload.startTime || payload.start_time,
    endTime: payload.endTime || payload.end_time,
    status: normalizeStatus(payload.status),
    note: String(payload.note || '').trim()
  };

  await validateShiftPayload(data);
  const shiftCode = payload.shiftCode || payload.shift_code || await generateShiftCode();

  const rows = await query(`
    INSERT INTO shift_assignments (
      shift_code, employee_type, employee_id, department_id, work_date,
      shift_name, start_time, end_time, status, note
    )
    OUTPUT INSERTED.id
    VALUES (
      @shiftCode, @employeeType, @employeeId, @departmentId, @workDate,
      @shiftName, @startTime, @endTime, @status, NULLIF(@note, '')
    )
  `, {
    ...data,
    shiftCode
  });

  return getShiftAssignmentById(rows[0].id);
}

async function updateShiftAssignment(id, payload) {
  await ensureShiftAssignmentTables();
  const existing = await getShiftAssignmentById(id);
  if (!existing) throw new Error('Không tìm thấy phân ca.');
  if (existing.status === 'Hoàn thành') throw new Error('Không thể sửa phân ca đã hoàn thành.');

  const employee = parseEmployeeKey(
    payload.employeeKey,
    payload.employeeType || payload.employee_type,
    payload.employeeId || payload.employee_id
  );
  const data = {
    employeeType: employee.employeeType,
    employeeId: employee.employeeId,
    departmentId: Number(payload.departmentId || payload.department_id),
    workDate: getDateOnly(payload.workDate || payload.work_date),
    shiftName: String(payload.shiftName || payload.shift_name || '').trim(),
    startTime: payload.startTime || payload.start_time,
    endTime: payload.endTime || payload.end_time,
    status: normalizeStatus(payload.status),
    note: String(payload.note || '').trim()
  };

  await validateShiftPayload(data, { ignoreId: id });

  await execute(`
    UPDATE shift_assignments
    SET employee_type = @employeeType,
      employee_id = @employeeId,
      department_id = @departmentId,
      work_date = @workDate,
      shift_name = @shiftName,
      start_time = @startTime,
      end_time = @endTime,
      status = @status,
      note = NULLIF(@note, ''),
      updated_at = SYSDATETIME()
    WHERE id = @id
  `, {
    ...data,
    id: Number(id)
  });

  return getShiftAssignmentById(id);
}

async function deleteShiftAssignment(id) {
  await ensureShiftAssignmentTables();
  const existing = await getShiftAssignmentById(id);
  if (!existing) throw new Error('Không tìm thấy phân ca.');
  if (existing.status !== 'Chờ thực hiện') throw new Error('Chỉ được xóa phân ca chưa thực hiện.');

  await execute(`
    UPDATE shift_assignments
    SET status = N'Hủy ca',
      updated_at = SYSDATETIME()
    WHERE id = @id
  `, { id: Number(id) });
}

async function updateShiftStatus(id, status) {
  await ensureShiftAssignmentTables();
  const existing = await getShiftAssignmentById(id);
  if (!existing) throw new Error('Không tìm thấy phân ca.');

  const normalizedStatus = normalizeStatus(status);
  if (!SHIFT_STATUSES.includes(normalizedStatus)) throw new Error('Trạng thái phân ca không hợp lệ.');

  await execute(`
    UPDATE shift_assignments
    SET status = @status,
      updated_at = SYSDATETIME()
    WHERE id = @id
  `, {
    id: Number(id),
    status: normalizedStatus
  });

  return getShiftAssignmentById(id);
}

module.exports = {
  SHIFT_STATUSES,
  getEmployees,
  getDepartments,
  getShiftAssignments,
  getShiftAssignmentById,
  createShiftAssignment,
  updateShiftAssignment,
  deleteShiftAssignment,
  updateShiftStatus,
  parseEmployeeKey
};
