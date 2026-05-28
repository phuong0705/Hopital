const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'DOCTOR', 'NURSE']), modulesController.treatments);
router.post('/:id/status', requireRole(['ADMIN', 'NURSE']), modulesController.updateTreatmentStatus);

module.exports = router;
