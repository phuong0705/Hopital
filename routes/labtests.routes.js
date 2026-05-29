const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');
const { uploadLabResultImages } = require('../middlewares/lab-result-upload.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'LAB', 'RECEPTIONIST']), modulesController.labtests);
router.post('/', requireRole(['ADMIN', 'DOCTOR']), modulesController.createLabTest);
router.post('/:testCode/result', requireRole(['ADMIN', 'LAB']), uploadLabResultImages, modulesController.updateLabTestResult);
router.post('/:testCode/confirm-cost', requireRole(['ADMIN', 'LAB']), modulesController.confirmLabCost);

module.exports = router;
