const express = require('express');
const shiftAssignmentController = require('../controllers/shift-assignment.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(requireRole(shiftAssignmentController.MANAGER_ROLES));

router.get('/phan-ca', shiftAssignmentController.managerPage);
router.get('/shift-assignments', shiftAssignmentController.managerPage);
router.post('/phan-ca', shiftAssignmentController.withMode('manager', shiftAssignmentController.createWeb));
router.post('/phan-ca/:id/update', shiftAssignmentController.withMode('manager', shiftAssignmentController.updateWeb));
router.post('/phan-ca/:id/delete', shiftAssignmentController.withMode('manager', shiftAssignmentController.deleteWeb));
router.post('/phan-ca/:id/status', shiftAssignmentController.withMode('manager', shiftAssignmentController.updateStatusWeb));

module.exports = router;
