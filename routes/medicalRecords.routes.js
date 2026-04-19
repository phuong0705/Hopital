const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'DOCTOR', 'NURSE']), modulesController.medicalRecords);
router.get('/:id', requireRole(['ADMIN', 'DOCTOR', 'NURSE']), modulesController.medicalRecordDetail);

module.exports = router;
