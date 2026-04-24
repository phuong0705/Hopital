const { businessGroups } = require('../config/business-processes');
const patientRepository = require('../repositories/patient.repository');
const cashierRepository = require('../repositories/cashier.repository');

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

async function exposeUser(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.businessGroups = businessGroups;
  res.locals.flash = {
    success: req.flash('success'),
    error: req.flash('error'),
    warning: req.flash('warning')
  };

  res.locals.unreadCount = 0;
  res.locals.cashierCounts = {
    appointmentsToday: 0,
    adjustmentsToday: 0,
    unpaidBills: 0,
    queueCount: 0
  };
  if (req.session.user) {
    try {
      res.locals.unreadCount = await patientRepository.getUnreadNotificationCount(req.session.user.userId);
      if (['ADMIN', 'RECEPTIONIST'].includes(req.session.user.roleCode)) {
        res.locals.cashierCounts = await cashierRepository.getCashierSidebarCounts();
      }
    } catch (err) {
      console.error('Error fetching layout counters:', err);
    }
  }

  return next();
}

module.exports = {
  requireAuth,
  redirectIfAuthenticated,
  exposeUser
};
