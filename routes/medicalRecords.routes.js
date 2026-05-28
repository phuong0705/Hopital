const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), modulesController.medicalRecords);
router.post('/:id/complete', requireRole(['ADMIN', 'DOCTOR']), modulesController.completeMedicalRecord);
router.get('/:id', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), modulesController.medicalRecordDetail);

module.exports = router;
