const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'DOCTOR']), modulesController.discharges);
router.post('/', requireRole(['ADMIN', 'DOCTOR']), modulesController.createDischarge);

module.exports = router;
