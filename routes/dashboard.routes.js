const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/home', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB']), dashboardController.home);
router.get('/nurse', requireRole(['ADMIN', 'NURSE']), dashboardController.nurseShift);
router.get('/', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB']), dashboardController.index);

module.exports = router;
