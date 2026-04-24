const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/home', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), dashboardController.home);
router.get('/', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), dashboardController.index);

module.exports = router;
