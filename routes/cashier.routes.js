const express = require('express');
const cashierController = require('../controllers/cashier.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(requireRole(['RECEPTIONIST']));

router.get('/dat-lich-hen-kham', cashierController.appointments);
router.post('/dat-lich-hen-kham', cashierController.createAppointment);
router.post('/dat-lich-hen-kham/:id/status', cashierController.updateAppointmentStatus);
router.get('/hang-cho', cashierController.queue);
router.get('/in-phieu-hoa-don', cashierController.printDocuments);
router.get('/hoan-tien-dieu-chinh', cashierController.adjustments);
router.post('/hoan-tien-dieu-chinh', cashierController.createAdjustment);
router.get('/bao-cao-ca', cashierController.shiftReport);

module.exports = router;
