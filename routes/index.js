const express = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const dashboardController = require('../controllers/dashboard.controller');
const shiftAssignmentController = require('../controllers/shift-assignment.controller');
const shiftAssignmentApiRoutes = require('./shift-assignments.routes');

const router = express.Router();

router.get('/', (req, res) => {
  if (req.session.user) {
    if (req.session.user.roleCode === 'PATIENT') return res.redirect('/patients/me');
    return res.redirect('/dashboard/home');
  }

  return res.render('landing', {
    title: 'Trang chủ',
    layout: 'layouts/landing'
  });
});

router.use('/', require('./auth.routes'));
router.use('/api/reports', require('./reports-api.routes'));
router.use('/api/shift-assignments', requireAuth, require('./shift-assignments.routes'));
router.use('/api/admin/shift-assignments', requireAuth, requireRole(['ADMIN']), shiftAssignmentApiRoutes.buildRouter('admin'));
router.use('/api/manager/shift-assignments', requireAuth, requireRole(shiftAssignmentController.MANAGER_ROLES), shiftAssignmentApiRoutes.buildRouter('manager'));
router.get('/api/my-shifts', requireAuth, requireRole(shiftAssignmentController.STAFF_VIEW_ROLES), shiftAssignmentController.myShiftsApi);
router.get('/api/doctor/my-shifts', requireAuth, requireRole(['DOCTOR']), shiftAssignmentController.myShiftsApi);
router.get('/api/nurse/my-shifts', requireAuth, requireRole(['NURSE']), shiftAssignmentController.myShiftsApi);
router.get('/api/staff/my-shifts', requireAuth, requireRole(shiftAssignmentController.STAFF_ROLES), shiftAssignmentController.myShiftsApi);
router.get('/api/dashboard/summary', requireAuth, dashboardController.dashboardSummary);
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
router.use('/manager', requireAuth, require('./manager.routes'));
router.use('/department-manager', requireAuth, require('./manager.routes'));
router.get('/doctor/phan-ca-cua-toi', requireAuth, requireRole(['DOCTOR']), shiftAssignmentController.doctorPage);
router.get('/doctor/my-shifts', requireAuth, requireRole(['DOCTOR']), shiftAssignmentController.doctorPage);
router.get('/nurse/phan-ca-cua-toi', requireAuth, requireRole(['NURSE']), shiftAssignmentController.nursePage);
router.get('/nurse/my-shifts', requireAuth, requireRole(['NURSE']), shiftAssignmentController.nursePage);
router.get('/staff/phan-ca-cua-toi', requireAuth, requireRole(shiftAssignmentController.STAFF_ROLES), shiftAssignmentController.staffPage);
router.get('/staff/my-shifts', requireAuth, requireRole(shiftAssignmentController.STAFF_ROLES), shiftAssignmentController.staffPage);
router.use('/thu-ngan', requireAuth, require('./cashier.routes'));
router.use('/nghiep-vu', requireAuth, require('./business.routes'));

module.exports = router;
