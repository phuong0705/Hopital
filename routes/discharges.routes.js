const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'DOCTOR', 'RECEPTIONIST']), modulesController.discharges);
router.post('/', requireRole(['ADMIN', 'DOCTOR', 'RECEPTIONIST']), modulesController.createDischarge);
router.post('/:id/payment', requireRole(['ADMIN', 'RECEPTIONIST']), modulesController.updateDischargePayment);

module.exports = router;
