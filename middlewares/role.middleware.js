const { businessGroups } = require('../config/business-processes');
const { query } = require('../repositories/base.repository');

const moduleRoutes = businessGroups.flatMap((group) =>
  group.items.map((item) => ({
    key: item.key,
    href: item.href.replace(/\/$/, '')
  }))
);

function getRequestPath(req) {
  return (req.originalUrl || req.url || '')
    .split('?')[0]
    .replace(/\/$/, '') || '/';
}

function findMatchedModuleKeys(req) {
  const requestPath = getRequestPath(req);
  return moduleRoutes
    .filter((item) => requestPath === item.href || requestPath.startsWith(`${item.href}/`))
    .map((item) => item.key);
}

async function hasModulePermission(roleCode, moduleKeys) {
  if (!moduleKeys.length) return null;

  const params = moduleKeys.reduce((map, key, index) => ({
    ...map,
    [`moduleKey${index}`]: key
  }), { roleCode });

  const rows = await query(`
    SELECT allowed
    FROM RoleModulePermissions
    WHERE role_code = @roleCode
      AND module_key IN (${moduleKeys.map((_, index) => `@moduleKey${index}`).join(', ')})
  `, params);

  if (!rows.length) return null;
  return rows.some((row) => Boolean(row.allowed));
}

function renderForbidden(res) {
  res.status(403);
  return res.render('errors/403', {
    title: 'Không có quyền truy cập',
    activeMenu: ''
  });
}

function requireRole(roles = []) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return async (req, res, next) => {
    const user = req.session.user;

    if (!user) {
      req.flash('error', 'Phiên đăng nhập đã hết hạn.');
      return res.redirect('/login');
    }

    if (user.roleCode === 'ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(user.roleCode)) {
      return renderForbidden(res);
    }

    const moduleKeys = findMatchedModuleKeys(req);
    if (moduleKeys.length) {
      try {
        const isAllowedByMatrix = await hasModulePermission(user.roleCode, moduleKeys);
        if (isAllowedByMatrix === false) return renderForbidden(res);
      } catch (error) {
        console.error('Khong the kiem tra RoleModulePermissions:', error.message);
      }
    }

    return next();
  };
}

module.exports = {
  requireRole
};
