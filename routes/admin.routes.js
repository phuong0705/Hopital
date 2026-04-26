const express = require('express');
const adminController = require('../controllers/admin.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(requireRole(['ADMIN']));

router.get('/roles-permissions', adminController.rolesPermissions);
router.post('/roles-permissions/modules', adminController.updateRoleModulePermissions);
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
