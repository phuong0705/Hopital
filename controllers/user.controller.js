const userRepository = require('../repositories/user.repository');
const formatters = require('../services/formatters');

function getUsersRedirect(returnTo) {
  const target = String(returnTo || '').trim();
  return target.startsWith('/users') ? target : '/users';
}

async function listUsers(req, res, next) {
  try {
    const pageSize = 10;
    const requestedPage = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const filters = {
      search: String(req.query.q || '').trim(),
      roleCode: String(req.query.role || '').trim(),
      status: String(req.query.status || '').trim()
    };
    const [totalRows, roles] = await Promise.all([
      userRepository.countUsers(filters),
      userRepository.getRoles()
    ]);
    const totalPages = Math.max(Math.ceil(totalRows / pageSize), 1);
    const page = Math.min(requestedPage, totalPages);
    const rows = await userRepository.getUsers({ ...filters, page, pageSize });
    res.render('users/index', {
      title: 'Quản lý tài khoản',
      activeMenu: 'hr-users',
      rows,
      roles,
      filters: {
        q: filters.search,
        role: filters.roleCode,
        status: filters.status
      },
      pagination: {
        page,
        pageSize,
        totalRows,
        totalPages
      },
      format: formatters
    });
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    await userRepository.createUser(req.body);
    req.flash('success', 'Tạo tài khoản thành công.');
    res.redirect(getUsersRedirect(req.body.returnTo));
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    await userRepository.updateUser(req.params.id, req.body);
    req.flash('success', 'Cập nhật tài khoản thành công.');
    res.redirect(getUsersRedirect(req.body.returnTo));
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    await userRepository.deleteUser(req.params.id);
    req.flash('success', 'Xóa tài khoản thành công.');
    res.redirect(getUsersRedirect(req.body.returnTo));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser
};
