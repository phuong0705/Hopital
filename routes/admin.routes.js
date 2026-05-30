const express = require('express');
const adminController = require('../controllers/admin.controller');
const shiftAssignmentController = require('../controllers/shift-assignment.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(requireRole(['ADMIN']));

router.get('/roles-permissions', adminController.rolesPermissions);
router.post('/roles-permissions/modules', adminController.updateRoleModulePermissions);
router.get('/phan-ca', shiftAssignmentController.adminPage);
router.get('/shift-assignments', shiftAssignmentController.adminPage);
router.get('/phan-ca/new', shiftAssignmentController.withMode('admin', shiftAssignmentController.createPage));
router.get('/phan-ca/edit', shiftAssignmentController.withMode('admin', shiftAssignmentController.editPage));
router.post('/phan-ca/batch', shiftAssignmentController.withMode('admin', shiftAssignmentController.createBatchWeb));
router.post('/phan-ca/batch-update', shiftAssignmentController.withMode('admin', shiftAssignmentController.updateBatchWeb));
router.post('/phan-ca', shiftAssignmentController.withMode('admin', shiftAssignmentController.createWeb));
router.post('/phan-ca/:id/update', shiftAssignmentController.withMode('admin', shiftAssignmentController.updateWeb));
router.post('/phan-ca/:id/delete', shiftAssignmentController.withMode('admin', shiftAssignmentController.deleteWeb));
router.post('/phan-ca/:id/status', shiftAssignmentController.withMode('admin', shiftAssignmentController.updateStatusWeb));
router.post('/roles', adminController.createRole);
router.post('/roles/:id/update', adminController.updateRole);
router.post('/roles/:id/delete', adminController.deleteRole);
router.get('/modules', adminController.modules);
router.get('/staff', adminController.staff);
router.get('/integrations', adminController.integrations);
router.get('/backup-restore', adminController.backupRestore);
router.get('/audit-log', adminController.auditLog);
router.get('/monitoring', adminController.monitoring);

module.exports = router;
