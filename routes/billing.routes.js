const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'RECEPTIONIST', 'NURSE']), modulesController.billing);
router.post('/', requireRole(['ADMIN', 'RECEPTIONIST']), modulesController.createBilling);

module.exports = router;
