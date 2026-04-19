const { businessGroups } = require('../config/business-processes');

function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Vui lòng đăng nhập để tiếp tục.');
    return res.redirect('/login');
  }
  return next();
}

function redirectIfAuthenticated(req, res, next) {
  if (req.session.user) {
    return res.redirect(req.session.user.roleCode === 'PATIENT' ? '/patients/me' : '/dashboard');
  }
  return next();
}

function exposeUser(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.businessGroups = businessGroups;
  res.locals.flash = {
    success: req.flash('success'),
    error: req.flash('error'),
    warning: req.flash('warning')
  };
  return next();
}

module.exports = {
  requireAuth,
  redirectIfAuthenticated,
  exposeUser
};
