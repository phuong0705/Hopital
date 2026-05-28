const express = require('express');
const modulesController = require('../controllers/modules.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', requireRole(['ADMIN', 'DOCTOR']), modulesController.prescriptions);
router.post('/', requireRole(['ADMIN', 'DOCTOR']), modulesController.createPrescription);
router.get('/:id/in-bieu-mau-noi-tru', requireRole(['ADMIN', 'DOCTOR']), modulesController.printPrescriptionTemplate);

module.exports = router;
