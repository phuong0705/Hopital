function requireRole(roles = []) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    const user = req.session.user;

    if (!user) {
      req.flash('error', 'Phiên đăng nhập đã hết hạn.');
      return res.redirect('/login');
    }

    if (user.roleCode === 'ADMIN' || allowedRoles.includes(user.roleCode)) {
      return next();
    }

    res.status(403);
    return res.render('errors/403', {
      title: 'Không có quyền truy cập',
      activeMenu: ''
    });
  };
}

module.exports = {
  requireRole
};
