const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), modulesController.beds);
router.post('/transfer', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), modulesController.transferBed);

module.exports = router;
