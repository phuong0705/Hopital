const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), modulesController.doctors);
router.post('/', requireRole(['ADMIN']), modulesController.createDoctor);
router.post('/:id/update', requireRole(['ADMIN']), modulesController.updateDoctor);
router.post('/:id/delete', requireRole(['ADMIN']), modulesController.deleteDoctor);

module.exports = router;
