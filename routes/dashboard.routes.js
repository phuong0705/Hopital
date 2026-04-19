const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), dashboardController.index);

module.exports = router;
