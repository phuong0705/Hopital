const express = require('express');
const patientsController = require('../controllers/patients.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/reception', requireRole(['ADMIN', 'RECEPTIONIST']), patientsController.receptionForm);
router.post('/reception', requireRole(['ADMIN', 'RECEPTIONIST']), patientsController.createAdmission);
router.get('/me', requireRole(['PATIENT']), patientsController.myProfile);
router.get('/me/treatments', requireRole(['PATIENT']), patientsController.treatmentsPage);
router.get('/me/medicines', requireRole(['PATIENT']), patientsController.medicinesPage);
router.get('/me/labtests', requireRole(['PATIENT']), patientsController.labTestsPage);
router.get('/me/billing', requireRole(['PATIENT']), patientsController.billingPage);
router.get('/me/discharge', requireRole(['PATIENT']), patientsController.dischargePage);
router.get('/me/support', requireRole(['PATIENT']), patientsController.supportPage);
router.get('/me/bhyt', requireRole(['PATIENT']), patientsController.bhytPage);
router.get('/me/booking', requireRole(['PATIENT']), patientsController.bookingPage);
router.post('/me/booking', requireRole(['PATIENT']), patientsController.submitBooking);
router.get('/me/notifications', requireRole(['PATIENT']), patientsController.notificationsPage);
router.post('/me/support', requireRole(['PATIENT']), patientsController.createSupportRequest);
router.get('/', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), patientsController.doctorOverview);
router.get('/list', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), patientsController.list);
router.post('/:admissionId/status', requireRole(['ADMIN', 'DOCTOR', 'NURSE']), patientsController.updateStatus);
router.get('/:id', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), patientsController.detail);

module.exports = router;
