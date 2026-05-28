const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'RECEPTIONIST', 'NURSE']), modulesController.billing);
router.post('/', requireRole(['ADMIN', 'RECEPTIONIST']), modulesController.createBilling);
router.get('/receipts/:id/print', requireRole(['ADMIN', 'RECEPTIONIST']), modulesController.printReceipt);
router.post('/admissions/:admissionId/notify', requireRole(['ADMIN', 'RECEPTIONIST']), modulesController.notifyPaymentDue);
router.post('/admissions/:admissionId/confirm-discharge', requireRole(['ADMIN', 'RECEPTIONIST']), modulesController.confirmBillingDischarge);

module.exports = router;
