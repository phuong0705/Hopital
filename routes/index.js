const express = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect(req.session.user.roleCode === 'PATIENT' ? '/patients/me' : '/dashboard');
  }

  return res.render('landing', {
    title: 'Trang chủ',
    layout: 'layouts/landing'
  });
});

router.use('/', require('./auth.routes'));
router.use('/api/reports', require('./reports-api.routes'));
router.get('/api/dashboard/doctor', requireAuth, dashboardController.doctorSummary);
router.get('/reports', requireAuth, (req, res) => {
  const target = new URL(process.env.REPORTS_FRONTEND_URL || 'http://localhost:3003/reports');
  if (req.query.tab) {
    target.searchParams.set('tab', req.query.tab);
  }

  return res.redirect(target.toString());
});
router.use('/dashboard', requireAuth, require('./dashboard.routes'));
router.use('/patients', requireAuth, require('./patients.routes'));
router.use('/medical-records', requireAuth, require('./medicalRecords.routes'));
router.use('/departments', requireAuth, require('./departments.routes'));
router.use('/beds', requireAuth, require('./beds.routes'));
router.use('/doctors', requireAuth, require('./doctors.routes'));
router.use('/nursing', requireAuth, require('./nursing.routes'));
router.use('/treatments', requireAuth, require('./treatments.routes'));
router.use('/prescriptions', requireAuth, require('./prescriptions.routes'));
router.use('/labtests', requireAuth, require('./labtests.routes'));
router.use('/billing', requireAuth, require('./billing.routes'));
router.use('/bhyt', requireAuth, require('./bhyt.routes'));
router.use('/discharges', requireAuth, require('./discharges.routes'));
router.use('/users', requireAuth, require('./users.routes'));
router.use('/settings', requireAuth, require('./settings.routes'));
router.use('/admin', requireAuth, require('./admin.routes'));
router.use('/thu-ngan', requireAuth, require('./cashier.routes'));
router.use('/nghiep-vu', requireAuth, require('./business.routes'));

module.exports = router;
