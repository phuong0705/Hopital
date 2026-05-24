const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');
const { uploadLabResultFiles } = require('../middlewares/lab-result-upload.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'LAB']), modulesController.labtests);
router.post('/', requireRole(['ADMIN', 'DOCTOR']), modulesController.createLabTest);
router.post('/:testCode/result', requireRole(['ADMIN', 'NURSE', 'LAB']), uploadLabResultFiles.array('resultFiles', 10), modulesController.updateLabTestResult);

module.exports = router;
