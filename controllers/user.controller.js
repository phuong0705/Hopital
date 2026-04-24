const userRepository = require('../repositories/user.repository');
const formatters = require('../services/formatters');

async function listUsers(req, res, next) {
  try {
    const [rows, roles] = await Promise.all([
      userRepository.getUsers(),
      userRepository.getRoles()
    ]);
    res.render('users/index', {
      title: 'Quản lý tài khoản',
      activeMenu: 'hr-users',
      rows,
      roles,
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
    res.redirect('/users');
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    await userRepository.updateUser(req.params.id, req.body);
    req.flash('success', 'Cập nhật tài khoản thành công.');
    res.redirect('/users');
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    await userRepository.deleteUser(req.params.id);
    req.flash('success', 'Xóa tài khoản thành công.');
    res.redirect('/users');
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
