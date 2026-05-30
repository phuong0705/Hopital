const shiftAssignmentRepository = require('../repositories/shift-assignment.repository');
const moduleRepository = require('../repositories/module.repository');

const MANAGER_ROLES = ['MANAGER', 'DEPARTMENT_HEAD', 'HEAD_DOCTOR'];
const STAFF_ROLES = ['RECEPTIONIST', 'PHARMACY', 'LAB'];
const STAFF_VIEW_ROLES = ['ADMIN', 'DOCTOR', 'NURSE', ...STAFF_ROLES, ...MANAGER_ROLES];
const SHIFT_TEMPLATES = [
  { name: 'Ca sáng', startTime: '07:00', endTime: '13:00', color: 'blue' },
  { name: 'Ca chiều', startTime: '13:00', endTime: '21:00', color: 'orange' },
  { name: 'Ca đêm', startTime: '21:00', endTime: '07:00', color: 'purple' },
  { name: 'Ca hành chính', startTime: '07:00', endTime: '17:00', color: 'green' }
];

const PAGE_CONFIGS = {
  admin: {
    mode: 'admin',
    title: 'PHÂN CA THEO TUẦN',
    description: 'Theo dõi lịch trực / lịch làm việc của nhân viên.',
    activeMenu: 'admin-shift-assignments',
    actionPath: '/admin/phan-ca',
    resetPath: '/admin/phan-ca',
    tableMode: 'admin',
    canManage: true,
    showSearch: true,
    showDepartmentFilter: true,
    showEmployeeFilter: true,
    showRoleFilter: true,
    showShiftFilter: true,
    showStatusFilter: true
  },
  manager: {
    mode: 'manager',
    title: 'Phân ca khoa của tôi',
    description: 'Quản lý lịch trực của nhân viên thuộc khoa/phòng phụ trách.',
    activeMenu: 'manager-shift-assignments',
    actionPath: '/manager/phan-ca',
    resetPath: '/manager/phan-ca',
    tableMode: 'manager',
    canManage: true,
    showSearch: true,
    showDepartmentFilter: false,
    showEmployeeFilter: true,
    showRoleFilter: false,
    showShiftFilter: true,
    showStatusFilter: true
  },
  doctor: {
    mode: 'doctor',
    title: 'Lịch trực của tôi',
    description: 'Xem lịch trực và ca làm việc được phân công.',
    activeMenu: 'doctor-my-shifts',
    actionPath: '/doctor/phan-ca-cua-toi',
    resetPath: '/doctor/phan-ca-cua-toi',
    tableMode: 'personal',
    canManage: false,
    personalLabel: 'Vị trí trực'
  },
  nurse: {
    mode: 'nurse',
    title: 'Lịch trực của tôi',
    description: 'Xem lịch trực và ca chăm sóc được phân công.',
    activeMenu: 'nurse-my-shifts',
    actionPath: '/nurse/phan-ca-cua-toi',
    resetPath: '/nurse/phan-ca-cua-toi',
    tableMode: 'personal',
    canManage: false,
    personalLabel: 'Khu vực/phòng bệnh'
  },
  staff: {
    mode: 'staff',
    title: 'Lịch làm việc của tôi',
    description: 'Xem lịch làm việc cá nhân.',
    activeMenu: 'staff-my-shifts',
    actionPath: '/staff/phan-ca-cua-toi',
    resetPath: '/staff/phan-ca-cua-toi',
    tableMode: 'personal',
    canManage: false,
    personalLabel: 'Công việc/vị trí phụ trách'
  },
  auto: {
    mode: 'auto',
    title: 'Phân ca',
    description: 'Xem lịch phân ca theo quyền truy cập hiện tại.',
    activeMenu: 'shift-assignments',
    actionPath: '/nghiep-vu/phan-ca',
    resetPath: '/nghiep-vu/phan-ca',
    tableMode: 'auto',
    canManage: false
  }
};

function getMode(req) {
  return req.shiftAssignmentMode || 'auto';
}

function getPageConfig(mode, user) {
  if (mode === 'auto') {
    if (user?.roleCode === 'ADMIN') return PAGE_CONFIGS.admin;
    if (MANAGER_ROLES.includes(user?.roleCode)) return PAGE_CONFIGS.manager;
    if (user?.roleCode === 'DOCTOR') return PAGE_CONFIGS.doctor;
    if (user?.roleCode === 'NURSE') return PAGE_CONFIGS.nurse;
    return PAGE_CONFIGS.staff;
  }
  return PAGE_CONFIGS[mode] || PAGE_CONFIGS.auto;
}

function withMode(mode, handler) {
  return (req, res, next) => {
    req.shiftAssignmentMode = mode;
    return handler(req, res, next);
  };
}

function getFilters(query = {}) {
  const employeeKey = query.employeeKey || (
    query.employee_type && query.employee_id ? `${query.employee_type}:${query.employee_id}` : ''
  );
  return {
    q: query.q || '',
    departmentId: query.departmentId || query.department_id || '',
    employeeKey,
    roleCode: query.roleCode || query.role_code || '',
    weekStart: query.weekStart || query.week_start || '',
    workDate: query.workDate || query.work_date || '',
    shiftName: query.shiftName || query.shift_name || '',
    status: query.status || ''
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

function addDays(value, days) {
  const date = new Date(`${getDateOnly(value)}T00:00:00`);
  date.setDate(date.getDate() + days);
  return getDateOnly(date);
}

function getMonday(value = new Date()) {
  const date = new Date(`${getDateOnly(value)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return getMonday(new Date());
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return getDateOnly(date);
}

function getWeekRange(filters) {
  const start = getMonday(filters.weekStart || filters.workDate || new Date());
  const end = addDays(start, 6);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const value = addDays(start, index);
    const [year, month, day] = value.split('-');
    return {
      value,
      label: index === 6 ? 'Chủ nhật' : `Thứ ${index + 2}`,
      display: `${day}/${month}`
    };
  });

  return { start, end, weekDays };
}

function buildWeeklyRows(rows, employees, weekDays, options = {}) {
  const employeeMap = new Map();
  employees.forEach((employee) => employeeMap.set(employee.employeeKey, employee));
  rows.forEach((row) => {
    if (!employeeMap.has(row.employeeKey)) {
      employeeMap.set(row.employeeKey, {
        employeeKey: row.employeeKey,
        fullName: row.employeeName,
        employeeCode: row.employeeCode,
        roleName: row.positionName,
        roleCode: row.roleCode,
        departmentName: row.departmentName,
        departmentId: row.departmentId
      });
    }
  });

  const rowMap = new Map();
  rows.forEach((shift) => {
    const employee = employeeMap.get(shift.employeeKey);
    if (!employee) return;
    if (!rowMap.has(shift.employeeKey)) {
      rowMap.set(shift.employeeKey, {
        employee,
        days: Object.fromEntries(weekDays.map((day) => [day.value, []])),
        shifts: [],
        total: 0
      });
    }

    const item = rowMap.get(shift.employeeKey);
    const dateKey = getDateOnly(shift.workDate);
    if (item.days[dateKey]) item.days[dateKey].push(shift);
    item.shifts.push(shift);
    item.total += 1;
  });

  return [...rowMap.values()]
    .filter((item) => options.includeEmpty || item.total > 0)
    .sort((a, b) => String(a.employee.fullName || '').localeCompare(String(b.employee.fullName || ''), 'vi'));
}

function canManage(user, mode = 'auto') {
  if (!user) return false;
  if (mode === 'admin') return user.roleCode === 'ADMIN';
  if (mode === 'manager') return MANAGER_ROLES.includes(user.roleCode);
  if (mode === 'auto') return user.roleCode === 'ADMIN' || MANAGER_ROLES.includes(user.roleCode);
  return false;
}

function canView(user) {
  return Boolean(user && STAFF_VIEW_ROLES.includes(user.roleCode));
}

function getUserDepartmentId(user) {
  return Number(user?.departmentId || user?.department_id || 0) || null;
}

async function getPersonalScope(user) {
  if (user.roleCode === 'DOCTOR') {
    const doctor = await moduleRepository.getDoctorByUser(user);
    if (doctor?.doctorId) return { scopeEmployeeType: 'DOCTOR', scopeEmployeeId: doctor.doctorId };
    return { scopeEmployeeType: 'DOCTOR', scopeEmployeeId: -1 };
  }

  return { scopeEmployeeType: 'USER', scopeEmployeeId: user.userId || -1 };
}

async function getScope(user, mode = 'auto') {
  if (!user) return { scopeEmployeeType: 'USER', scopeEmployeeId: -1 };

  if (mode === 'admin') {
    if (user.roleCode !== 'ADMIN') throw Object.assign(new Error('Không có quyền xem toàn bộ phân ca.'), { statusCode: 403 });
    return {};
  }

  if (mode === 'manager') {
    if (!MANAGER_ROLES.includes(user.roleCode)) throw Object.assign(new Error('Không có quyền quản lý phân ca khoa.'), { statusCode: 403 });
    const departmentId = getUserDepartmentId(user);
    if (!departmentId) throw Object.assign(new Error('Tài khoản chưa được gán khoa/phòng phụ trách.'), { statusCode: 403 });
    return { scopeDepartmentId: departmentId };
  }

  if (['doctor', 'nurse', 'staff'].includes(mode)) {
    return getPersonalScope(user);
  }

  if (user.roleCode === 'ADMIN') return {};
  if (MANAGER_ROLES.includes(user.roleCode)) {
    const departmentId = getUserDepartmentId(user);
    return departmentId ? { scopeDepartmentId: departmentId } : { scopeDepartmentId: -1 };
  }
  return getPersonalScope(user);
}

function redirectToList(req, extra = '') {
  const page = getPageConfig(getMode(req), req.session.user);
  const activeMenu = req.query.activeMenu || req.body.activeMenu || page.activeMenu;
  const separator = page.actionPath.includes('?') ? '&' : '?';
  return `${page.actionPath}${separator}activeMenu=${activeMenu}${extra}`;
}

function getRolePagePath(user) {
  if (user?.roleCode === 'ADMIN') return '/admin/phan-ca';
  if (MANAGER_ROLES.includes(user?.roleCode)) return '/manager/phan-ca';
  if (user?.roleCode === 'DOCTOR') return '/doctor/phan-ca-cua-toi';
  if (user?.roleCode === 'NURSE') return '/nurse/phan-ca-cua-toi';
  return '/staff/phan-ca-cua-toi';
}

function redirectByRole(req, res) {
  return res.redirect(getRolePagePath(req.session.user));
}

function forbiddenJson(res, message = 'Không có quyền thao tác phân ca.') {
  return res.status(403).json({ error: message });
}

async function assertVisibleToUser(user, row, mode = 'auto') {
  if (!row) throw Object.assign(new Error('Không tìm thấy phân ca.'), { statusCode: 404 });

  const scope = await getScope(user, mode);
  if (scope.scopeDepartmentId && Number(row.departmentId) !== Number(scope.scopeDepartmentId)) {
    throw Object.assign(new Error('Không có quyền xem phân ca này.'), { statusCode: 403 });
  }
  if (
    scope.scopeEmployeeType &&
    (row.employeeType !== scope.scopeEmployeeType || Number(row.employeeId) !== Number(scope.scopeEmployeeId))
  ) {
    throw Object.assign(new Error('Không có quyền xem phân ca này.'), { statusCode: 403 });
  }
}

async function assertManageScope(user, payload, mode = 'auto') {
  if (!canManage(user, mode)) {
    throw Object.assign(new Error('Không có quyền thao tác phân ca.'), { statusCode: 403 });
  }

  if (user.roleCode === 'ADMIN') return;

  const departmentId = getUserDepartmentId(user);
  const payloadDepartmentId = Number(payload.departmentId || payload.department_id);
  if (!departmentId || payloadDepartmentId !== departmentId) {
    throw Object.assign(new Error('Chỉ được thao tác phân ca thuộc khoa/phòng của bạn.'), { statusCode: 403 });
  }

  const payloadEmployeeKey = payload.employeeKey || (
    payload.employee_type && payload.employee_id ? `${payload.employee_type}:${payload.employee_id}` : ''
  );
  if (payloadEmployeeKey) {
    const employees = await shiftAssignmentRepository.getEmployees();
    const employee = employees.find((item) => item.employeeKey === payloadEmployeeKey);
    if (!employee || Number(employee.departmentId) !== departmentId) {
      throw Object.assign(new Error('Chỉ được phân ca cho nhân viên thuộc khoa/phòng của bạn.'), { statusCode: 403 });
    }
  }
}

function getRoleOptions(employees) {
  const map = new Map();
  employees.forEach((employee) => {
    const key = employee.employeeType === 'DOCTOR' ? 'DOCTOR' : employee.roleCode;
    const label = employee.employeeType === 'DOCTOR' ? 'Bác sĩ' : employee.roleName;
    if (key && label && !map.has(key)) map.set(key, label);
  });
  return [...map.entries()].map(([roleCode, roleName]) => ({ roleCode, roleName }));
}

function applyPageOptionScope(items, scope, key = 'departmentId') {
  if (!scope.scopeDepartmentId) return items;
  return items.filter((item) => Number(item[key]) === Number(scope.scopeDepartmentId));
}

async function listPage(req, res, next) {
  try {
    const mode = getMode(req);
    const page = getPageConfig(mode, req.session.user);
    const filters = getFilters(req.query);
    const weekRange = getWeekRange(filters);
    const scope = await getScope(req.session.user, page.mode);
    const effectiveFilters = page.tableMode === 'personal'
      ? { status: filters.status, weekStart: weekRange.start, weekEnd: weekRange.end }
      : { ...filters, weekStart: weekRange.start, weekEnd: weekRange.end, workDate: '' };

    const [rows, allEmployees, allDepartments] = await Promise.all([
      shiftAssignmentRepository.getShiftAssignments({ ...effectiveFilters, ...scope }),
      shiftAssignmentRepository.getEmployees(),
      shiftAssignmentRepository.getDepartments()
    ]);
    const employees = applyPageOptionScope(allEmployees, scope);
    const departments = applyPageOptionScope(allDepartments, scope);
    const weeklyRows = buildWeeklyRows(rows, employees, weekRange.weekDays, { includeEmpty: false });

    return res.render('business/shift-assignments', {
      title: page.title,
      activeMenu: req.query.activeMenu || page.activeMenu,
      page,
      rows,
      weeklyRows,
      weekRange,
      employees,
      departments,
      roleOptions: getRoleOptions(employees),
      statuses: shiftAssignmentRepository.SHIFT_STATUSES,
      filters,
      canManageShiftAssignments: canManage(req.session.user, page.mode)
    });
  } catch (error) {
    return next(error);
  }
}

async function createPage(req, res, next) {
  try {
    const mode = getMode(req);
    const page = getPageConfig(mode, req.session.user);
    if (!canManage(req.session.user, mode)) {
      req.flash('error', 'Không có quyền thêm phân ca.');
      return res.redirect(redirectToList(req));
    }

    const filters = getFilters(req.query);
    const weekRange = getWeekRange(filters);
    const scope = await getScope(req.session.user, page.mode);
    const [allEmployees, allDepartments] = await Promise.all([
      shiftAssignmentRepository.getEmployees(),
      shiftAssignmentRepository.getDepartments()
    ]);
    const employees = applyPageOptionScope(allEmployees, scope);
    const departments = applyPageOptionScope(allDepartments, scope);

    return res.render('business/shift-assignment-create', {
      title: 'Thêm phân ca',
      activeMenu: page.activeMenu,
      page,
      employees,
      departments,
      roleOptions: getRoleOptions(employees),
      weekRange,
      shiftTemplates: SHIFT_TEMPLATES,
      statusOptions: shiftAssignmentRepository.SHIFT_STATUSES,
      selectedDepartmentId: filters.departmentId || departments[0]?.departmentId || ''
    });
  } catch (error) {
    return next(error);
  }
}

async function editPage(req, res, next) {
  try {
    const mode = getMode(req);
    const page = getPageConfig(mode, req.session.user);
    if (!canManage(req.session.user, mode)) {
      req.flash('error', 'Không có quyền chỉnh sửa phân ca.');
      return res.redirect(redirectToList(req));
    }

    const filters = getFilters(req.query);
    const weekRange = getWeekRange(filters);
    const scope = await getScope(req.session.user, page.mode);
    const [allEmployees, allDepartments] = await Promise.all([
      shiftAssignmentRepository.getEmployees(),
      shiftAssignmentRepository.getDepartments()
    ]);
    const employees = applyPageOptionScope(allEmployees, scope);
    const departments = applyPageOptionScope(allDepartments, scope);
    const selectedDepartmentId = filters.departmentId || departments[0]?.departmentId || '';
    const existingAssignments = await shiftAssignmentRepository.getShiftAssignments({
      departmentId: selectedDepartmentId,
      weekStart: weekRange.start,
      weekEnd: weekRange.end,
      ...scope
    });

    return res.render('business/shift-assignment-create', {
      title: 'Chỉnh sửa phân ca',
      activeMenu: page.activeMenu,
      page,
      employees,
      departments,
      roleOptions: getRoleOptions(employees),
      weekRange,
      shiftTemplates: SHIFT_TEMPLATES,
      statusOptions: shiftAssignmentRepository.SHIFT_STATUSES,
      selectedDepartmentId,
      isEditPage: true,
      existingAssignments
    });
  } catch (error) {
    return next(error);
  }
}

async function createBatchWeb(req, res, next) {
  try {
    const mode = getMode(req);
    if (!canManage(req.session.user, mode)) {
      req.flash('error', 'Không có quyền thêm phân ca.');
      return res.redirect(redirectToList(req));
    }

    let assignments = [];
    try {
      assignments = JSON.parse(req.body.assignments || '[]');
    } catch (error) {
      assignments = [];
    }

    if (!Array.isArray(assignments) || !assignments.length) {
      req.flash('warning', 'Vui lòng kéo nhân viên vào ít nhất một ca trực.');
      return res.redirect(`${getPageConfig(mode, req.session.user).actionPath}/new`);
    }

    let createdCount = 0;
    for (const assignment of assignments) {
      const payload = {
        ...assignment,
        departmentId: req.body.departmentId || assignment.departmentId,
        status: assignment.status || 'Chờ thực hiện',
        note: assignment.note || req.body.note || ''
      };
      await assertManageScope(req.session.user, payload, mode);
      await shiftAssignmentRepository.createShiftAssignment(payload);
      createdCount += 1;
    }

    req.flash('success', `Đã lưu ${createdCount} phân ca.`);
    return res.redirect(redirectToList(req, req.body.weekStart ? `&weekStart=${req.body.weekStart}` : ''));
  } catch (error) {
    req.flash('error', error.message || 'Không thể lưu phân ca.');
    return res.redirect(`${getPageConfig(getMode(req), req.session.user).actionPath}/new`);
  }
}

async function updateBatchWeb(req, res, next) {
  try {
    const mode = getMode(req);
    if (!canManage(req.session.user, mode)) {
      req.flash('error', 'Không có quyền chỉnh sửa phân ca.');
      return res.redirect(redirectToList(req));
    }

    let assignments = [];
    try {
      assignments = JSON.parse(req.body.assignments || '[]');
    } catch (error) {
      assignments = [];
    }

    const page = getPageConfig(mode, req.session.user);
    const weekRange = getWeekRange({ weekStart: req.body.weekStart });
    const departmentId = req.body.departmentId;
    const scope = await getScope(req.session.user, page.mode);
    const existingRows = await shiftAssignmentRepository.getShiftAssignments({
      departmentId,
      weekStart: weekRange.start,
      weekEnd: weekRange.end,
      ...scope
    });
    const existingIds = new Set(existingRows.map((row) => Number(row.id)));
    const existingById = new Map(existingRows.map((row) => [Number(row.id), row]));
    const submittedIds = new Set();
    let savedCount = 0;
    let skippedCompletedCount = 0;

    for (const assignment of assignments) {
      const payload = {
        ...assignment,
        departmentId: departmentId || assignment.departmentId,
        status: assignment.status || 'Chờ thực hiện',
        note: assignment.note || req.body.note || ''
      };
      await assertManageScope(req.session.user, payload, mode);

      if (assignment.id && existingIds.has(Number(assignment.id))) {
        submittedIds.add(Number(assignment.id));
        if (existingById.get(Number(assignment.id))?.status === 'Hoàn thành') {
          skippedCompletedCount += 1;
          continue;
        }
        await shiftAssignmentRepository.updateShiftAssignment(assignment.id, payload);
      } else {
        await shiftAssignmentRepository.createShiftAssignment(payload);
      }
      savedCount += 1;
    }

    let skippedRemoveCount = 0;
    for (const row of existingRows) {
      if (submittedIds.has(Number(row.id))) continue;
      try {
        await shiftAssignmentRepository.deleteShiftAssignment(row.id);
      } catch (error) {
        skippedRemoveCount += 1;
      }
    }

    const warnings = [];
    if (skippedRemoveCount) warnings.push(`${skippedRemoveCount} ca không thể hủy vì không còn ở trạng thái chờ.`);
    if (skippedCompletedCount) warnings.push(`${skippedCompletedCount} ca đã hoàn thành được giữ nguyên.`);
    const message = warnings.length
      ? `Đã lưu ${savedCount} phân ca. ${warnings.join(' ')}`
      : `Đã cập nhật ${savedCount} phân ca.`;
    req.flash(warnings.length ? 'warning' : 'success', message);
    return res.redirect(`${page.actionPath}?activeMenu=${page.activeMenu}&weekStart=${weekRange.start}&departmentId=${departmentId || ''}`);
  } catch (error) {
    req.flash('error', error.message || 'Không thể cập nhật phân ca.');
    const query = new URLSearchParams();
    if (req.body.weekStart) query.set('weekStart', req.body.weekStart);
    if (req.body.departmentId) query.set('departmentId', req.body.departmentId);
    return res.redirect(`${getPageConfig(getMode(req), req.session.user).actionPath}/edit?${query.toString()}`);
  }
}

async function createWeb(req, res, next) {
  try {
    const mode = getMode(req);
    await assertManageScope(req.session.user, req.body, mode);
    await shiftAssignmentRepository.createShiftAssignment(req.body);
    req.flash('success', 'Thêm phân ca thành công.');
    return res.redirect(redirectToList(req));
  } catch (error) {
    req.flash('error', error.message || 'Không thể thêm phân ca.');
    return res.redirect(redirectToList(req));
  }
}

async function updateWeb(req, res, next) {
  try {
    const mode = getMode(req);
    const existing = await shiftAssignmentRepository.getShiftAssignmentById(req.params.id);
    await assertVisibleToUser(req.session.user, existing, mode);
    await assertManageScope(req.session.user, req.body, mode);
    await shiftAssignmentRepository.updateShiftAssignment(req.params.id, req.body);
    req.flash('success', 'Cập nhật phân ca thành công.');
    return res.redirect(redirectToList(req));
  } catch (error) {
    req.flash('error', error.message || 'Không thể cập nhật phân ca.');
    return res.redirect(redirectToList(req));
  }
}

async function deleteWeb(req, res, next) {
  try {
    const mode = getMode(req);
    if (!canManage(req.session.user, mode)) {
      req.flash('error', 'Không có quyền xóa phân ca.');
      return res.redirect(redirectToList(req));
    }

    const existing = await shiftAssignmentRepository.getShiftAssignmentById(req.params.id);
    await assertVisibleToUser(req.session.user, existing, mode);
    await shiftAssignmentRepository.deleteShiftAssignment(req.params.id);
    req.flash('success', 'Đã hủy phân ca chưa thực hiện.');
    return res.redirect(redirectToList(req));
  } catch (error) {
    req.flash('error', error.message || 'Không thể xóa phân ca.');
    return res.redirect(redirectToList(req));
  }
}

async function updateStatusWeb(req, res, next) {
  try {
    const mode = getMode(req);
    if (!canManage(req.session.user, mode)) {
      req.flash('error', 'Không có quyền cập nhật trạng thái phân ca.');
      return res.redirect(redirectToList(req));
    }

    const existing = await shiftAssignmentRepository.getShiftAssignmentById(req.params.id);
    await assertVisibleToUser(req.session.user, existing, mode);
    await shiftAssignmentRepository.updateShiftStatus(req.params.id, req.body.status);
    req.flash('success', 'Cập nhật trạng thái phân ca thành công.');
    return res.redirect(redirectToList(req));
  } catch (error) {
    req.flash('error', error.message || 'Không thể cập nhật trạng thái phân ca.');
    return res.redirect(redirectToList(req));
  }
}

async function listApi(req, res, next) {
  try {
    const mode = getMode(req);
    if (!canView(req.session.user)) return forbiddenJson(res);
    const scope = await getScope(req.session.user, mode);
    const filters = getFilters(req.query);
    const weekRange = getWeekRange(filters);
    const rows = await shiftAssignmentRepository.getShiftAssignments({
      ...filters,
      weekStart: weekRange.start,
      weekEnd: weekRange.end,
      workDate: '',
      ...scope
    });
    return res.json({ rows });
  } catch (error) {
    if (error.statusCode === 403) return forbiddenJson(res, error.message);
    return next(error);
  }
}

async function myShiftsApi(req, res, next) {
  try {
    const scope = await getPersonalScope(req.session.user);
    const filters = getFilters(req.query);
    const weekRange = getWeekRange(filters);
    const rows = await shiftAssignmentRepository.getShiftAssignments({
      status: filters.status,
      weekStart: weekRange.start,
      weekEnd: weekRange.end,
      ...scope
    });
    return res.json({ rows });
  } catch (error) {
    return next(error);
  }
}

async function detailApi(req, res, next) {
  try {
    const mode = getMode(req);
    if (!canView(req.session.user)) return forbiddenJson(res);
    const row = await shiftAssignmentRepository.getShiftAssignmentById(req.params.id);
    await assertVisibleToUser(req.session.user, row, mode);
    return res.json(row);
  } catch (error) {
    if (error.statusCode === 403) return forbiddenJson(res, error.message);
    if (error.statusCode === 404) return res.status(404).json({ error: error.message });
    return next(error);
  }
}

async function createApi(req, res) {
  try {
    const mode = getMode(req);
    await assertManageScope(req.session.user, req.body, mode);
    const row = await shiftAssignmentRepository.createShiftAssignment(req.body);
    return res.status(201).json(row);
  } catch (error) {
    if (error.statusCode === 403) return forbiddenJson(res, error.message);
    return res.status(400).json({ error: error.message || 'Không thể thêm phân ca.' });
  }
}

async function updateApi(req, res) {
  try {
    const mode = getMode(req);
    const existing = await shiftAssignmentRepository.getShiftAssignmentById(req.params.id);
    await assertVisibleToUser(req.session.user, existing, mode);
    await assertManageScope(req.session.user, req.body, mode);
    const row = await shiftAssignmentRepository.updateShiftAssignment(req.params.id, req.body);
    return res.json(row);
  } catch (error) {
    if (error.statusCode === 403) return forbiddenJson(res, error.message);
    if (error.statusCode === 404) return res.status(404).json({ error: error.message });
    return res.status(400).json({ error: error.message || 'Không thể cập nhật phân ca.' });
  }
}

async function deleteApi(req, res) {
  try {
    const mode = getMode(req);
    if (!canManage(req.session.user, mode)) return forbiddenJson(res);
    const existing = await shiftAssignmentRepository.getShiftAssignmentById(req.params.id);
    await assertVisibleToUser(req.session.user, existing, mode);
    await shiftAssignmentRepository.deleteShiftAssignment(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    if (error.statusCode === 403) return forbiddenJson(res, error.message);
    if (error.statusCode === 404) return res.status(404).json({ error: error.message });
    return res.status(400).json({ error: error.message || 'Không thể xóa phân ca.' });
  }
}

async function updateStatusApi(req, res) {
  try {
    const mode = getMode(req);
    if (!canManage(req.session.user, mode)) return forbiddenJson(res);
    const existing = await shiftAssignmentRepository.getShiftAssignmentById(req.params.id);
    await assertVisibleToUser(req.session.user, existing, mode);
    const row = await shiftAssignmentRepository.updateShiftStatus(req.params.id, req.body.status);
    return res.json(row);
  } catch (error) {
    if (error.statusCode === 403) return forbiddenJson(res, error.message);
    if (error.statusCode === 404) return res.status(404).json({ error: error.message });
    return res.status(400).json({ error: error.message || 'Không thể cập nhật trạng thái phân ca.' });
  }
}

module.exports = {
  MANAGER_ROLES,
  STAFF_ROLES,
  STAFF_VIEW_ROLES,
  withMode,
  adminPage: withMode('admin', listPage),
  managerPage: withMode('manager', listPage),
  doctorPage: withMode('doctor', listPage),
  nursePage: withMode('nurse', listPage),
  staffPage: withMode('staff', listPage),
  redirectByRole,
  createPage,
  editPage,
  createBatchWeb,
  updateBatchWeb,
  listPage,
  createWeb,
  updateWeb,
  deleteWeb,
  updateStatusWeb,
  listApi,
  myShiftsApi,
  detailApi,
  createApi,
  updateApi,
  deleteApi,
  updateStatusApi
};
