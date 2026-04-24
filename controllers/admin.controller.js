const os = require('os');
const { businessGroups } = require('../config/business-processes');
const adminRepository = require('../repositories/admin.repository');

function flattenModules() {
  return businessGroups.flatMap((group) =>
    group.items.map((item) => ({
      groupCode: group.code,
      groupTitle: group.title,
      key: item.key,
      title: item.title,
      href: item.href,
      roles: item.roles || group.roles,
      icon: item.icon
    }))
  );
}

async function rolesPermissions(req, res, next) {
  try {
    const [roles, counts] = await Promise.all([
      adminRepository.getRolesWithUserCounts(),
      adminRepository.getSystemCounts()
    ]);
    const modules = flattenModules();

    return res.render('admin/roles-permissions', {
      title: 'Quản lý Roles & Quyền',
      activeMenu: 'admin-roles',
      roles,
      modules,
      counts
    });
  } catch (error) {
    return next(error);
  }
}

async function createRole(req, res, next) {
  try {
    await adminRepository.createRole(req.body);
    req.flash('success', 'Tạo vai trò thành công.');
    res.redirect('/admin/roles-permissions');
  } catch (error) {
    next(error);
  }
}

async function updateRole(req, res, next) {
  try {
    await adminRepository.updateRole(req.params.id, req.body);
    req.flash('success', 'Cập nhật vai trò thành công.');
    res.redirect('/admin/roles-permissions');
  } catch (error) {
    next(error);
  }
}

async function deleteRole(req, res, next) {
  try {
    await adminRepository.deleteRole(req.params.id);
    req.flash('success', 'Xóa vai trò thành công.');
    res.redirect('/admin/roles-permissions');
  } catch (error) {
    next(error);
  }
}

async function modules(req, res, next) {
  try {
    const [roles, counts] = await Promise.all([
      adminRepository.getRolesWithUserCounts(),
      adminRepository.getSystemCounts()
    ]);

    return res.render('admin/modules', {
      title: 'Quản lý Module',
      activeMenu: 'admin-modules',
      modules: flattenModules(),
      roles,
      counts
    });
  } catch (error) {
    return next(error);
  }
}

async function staff(req, res, next) {
  try {
    const directory = await adminRepository.getStaffDirectory();
    const rows = [
      ...directory.doctors.map((row) => ({ ...row, sourceName: 'Doctors' })),
      ...directory.users.map((row) => ({ ...row, sourceName: 'Users' }))
    ];

    return res.render('admin/staff', {
      title: 'Quản lý bác sĩ / nhân viên',
      activeMenu: 'admin-staff',
      rows,
      summary: {
        doctors: directory.doctors.length,
        users: directory.users.length,
        active: rows.filter((row) => row.status === 'Đang làm việc' || row.status === 'Hoạt động').length
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function integrations(req, res, next) {
  try {
    const signals = await adminRepository.getIntegrationSignals();
    return res.render('admin/integrations', {
      title: 'Tích hợp HIS / LIS / PACS',
      activeMenu: 'admin-integrations',
      signals,
      env: {
        reportsFrontendUrl: process.env.REPORTS_FRONTEND_URL || '',
        reportsApiBaseUrl: process.env.REPORTS_API_BASE_URL || '',
        databaseConfigured: Boolean(process.env.DB_SERVER || process.env.DATABASE_URL)
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function backupRestore(req, res, next) {
  try {
    const [counts, realtime] = await Promise.all([
      adminRepository.getSystemCounts(),
      adminRepository.getRealtimeMetrics()
    ]);

    return res.render('admin/backup-restore', {
      title: 'Sao lưu & Phục hồi dữ liệu',
      activeMenu: 'admin-backup',
      counts,
      realtime
    });
  } catch (error) {
    return next(error);
  }
}

async function auditLog(req, res, next) {
  try {
    const rows = await adminRepository.getAuditEvents();
    return res.render('admin/audit-log', {
      title: 'Nhật ký hệ thống',
      activeMenu: 'admin-audit',
      rows
    });
  } catch (error) {
    return next(error);
  }
}

async function monitoring(req, res, next) {
  try {
    const metrics = await adminRepository.getRealtimeMetrics();
    return res.render('admin/monitoring', {
      title: 'Giám sát hệ thống realtime',
      activeMenu: 'admin-monitoring',
      metrics,
      runtime: {
        uptimeSeconds: Math.round(process.uptime()),
        memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        hostName: os.hostname(),
        nodeVersion: process.version,
        platform: `${os.platform()} ${os.release()}`
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  rolesPermissions,
  createRole,
  updateRole,
  deleteRole,
  modules,
  staff,
  integrations,
  backupRestore,
  auditLog,
  monitoring
};
