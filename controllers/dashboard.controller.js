async function index(req, res, next) {
  try {
    if (req.session.user.roleCode === 'RECEPTIONIST') {
      return res.render('dashboard/cashier', {
        title: 'Tổng quan thu ngân',
        activeMenu: 'dashboard'
      });
    }

    return res.render('dashboard/index', {
      title: 'Tổng quan',
      activeMenu: 'dashboard'
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  index
};
