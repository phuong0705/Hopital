const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'NURSE', 'RECEPTIONIST']), modulesController.beds);
router.post('/transfer', requireRole(['ADMIN', 'NURSE', 'RECEPTIONIST']), modulesController.transferBed);

module.exports = router;
