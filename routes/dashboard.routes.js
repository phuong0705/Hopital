const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/home', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB', 'PHARMACY']), dashboardController.home);
router.get('/nurse', requireRole(['ADMIN', 'NURSE']), dashboardController.nurseShift);
router.get('/pharmacy', requireRole(['ADMIN', 'PHARMACY']), dashboardController.pharmacy);
router.get('/', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB', 'PHARMACY']), dashboardController.index);

module.exports = router;
