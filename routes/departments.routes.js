const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), modulesController.departments);
router.post('/', requireRole(['ADMIN']), modulesController.createDepartment);
router.post('/:id/update', requireRole(['ADMIN']), modulesController.updateDepartment);
router.post('/:id/delete', requireRole(['ADMIN']), modulesController.deleteDepartment);
router.get('/:id', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), modulesController.departmentDetail);

// Room & Bed Management
router.post('/rooms', requireRole(['ADMIN']), modulesController.createRoom);
router.post('/rooms/:id', requireRole(['ADMIN']), modulesController.updateRoom);
router.post('/rooms/:id/delete', requireRole(['ADMIN']), modulesController.deleteRoom);
router.post('/beds', requireRole(['ADMIN']), modulesController.createBed);
router.post('/beds/:id', requireRole(['ADMIN']), modulesController.updateBed);
router.post('/beds/:id/delete', requireRole(['ADMIN']), modulesController.deleteBed);

module.exports = router;
