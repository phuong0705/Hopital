const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), modulesController.beds);
router.get('/rooms/:id', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), modulesController.roomDetail);
router.post('/rooms/:id/status', requireRole(['ADMIN', 'NURSE']), modulesController.updateRoomBedStatus);
router.post('/transfer', requireRole(['ADMIN', 'NURSE']), modulesController.transferBed);

module.exports = router;
