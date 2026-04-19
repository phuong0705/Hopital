const express = require('express');
const businessController = require('../controllers/business.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/danh-muc-benh', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), businessController.diseaseCatalog);
router.post('/danh-muc-benh', requireRole(['ADMIN', 'DOCTOR']), businessController.createDisease);
router.post('/danh-muc-benh/:id/status', requireRole(['ADMIN', 'DOCTOR']), businessController.updateDiseaseStatus);
router.get('/danh-muc-thuoc', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), businessController.medicineCatalog);
router.post('/danh-muc-thuoc', requireRole(['ADMIN', 'DOCTOR']), businessController.createMedicine);
router.post('/danh-muc-thuoc/:id/status', requireRole(['ADMIN', 'DOCTOR']), businessController.updateMedicineStatus);
router.get('/danh-muc-dich-vu', requireRole(['ADMIN', 'RECEPTIONIST', 'NURSE']), businessController.serviceCatalog);
router.post('/danh-muc-dich-vu', requireRole(['ADMIN', 'RECEPTIONIST']), businessController.createService);
router.post('/danh-muc-dich-vu/:id/status', requireRole(['ADMIN', 'RECEPTIONIST']), businessController.updateServiceStatus);

// Examination Module
router.get('/lap-phieu-kham', requireRole(['ADMIN', 'RECEPTIONIST', 'NURSE']), businessController.examTicket);
router.get('/chan-benh', requireRole(['ADMIN', 'DOCTOR']), businessController.diagnosis);
router.get('/tra-cuu-du-lieu-kham', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), businessController.clinicalLookup);
router.get('/theo-doi-ket-qua-kham', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), businessController.examResults);
router.get('/theo-doi-thoi-gian-nam', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), businessController.lengthOfStay);

// Treatment Module
router.get('/lap-phac-do', requireRole(['ADMIN', 'DOCTOR']), businessController.carePlan);
router.get('/tong-hop-ket-qua-xet-nghiem', requireRole(['ADMIN', 'DOCTOR', 'NURSE']), businessController.labSummary);

// Finance Module
router.get('/tinh-phi-kham', requireRole(['ADMIN', 'RECEPTIONIST']), businessController.feeExam);
router.get('/hoa-don', requireRole(['ADMIN', 'RECEPTIONIST']), businessController.invoiceList);

// Human Resource Module
router.get('/quan-ly-bac-si-truc', requireRole(['ADMIN']), businessController.doctorDuty);
router.post('/quan-ly-bac-si-truc/new', requireRole(['ADMIN']), businessController.createDoctorDuty);
router.post('/quan-ly-bac-si-truc/:id', requireRole(['ADMIN']), businessController.updateDoctorDuty);
router.post('/quan-ly-bac-si-truc/:id/delete', requireRole(['ADMIN']), businessController.removeDoctorDuty);
router.get('/quan-ly-ca-truc', requireRole(['ADMIN']), businessController.dutyShift);
router.get('/theo-doi-hieu-suat', requireRole(['ADMIN']), businessController.performance);

// Reports Module
router.get('/thong-ke-benh-nhan-noi-tru', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), businessController.reportInpatient);
router.get('/thong-ke-doanh-thu', requireRole(['ADMIN', 'RECEPTIONIST']), businessController.reportRevenue);
router.get('/thong-ke-luot-kham', requireRole(['ADMIN', 'RECEPTIONIST']), businessController.reportVisits);
router.get('/thong-ke-su-dung-thuoc', requireRole(['ADMIN', 'DOCTOR', 'NURSE']), businessController.reportMedicines);
router.get('/bao-cao-xuat-vien', requireRole(['ADMIN', 'DOCTOR', 'RECEPTIONIST']), businessController.reportDischarges);

// System Admin Module
router.get('/sao-luu-du-lieu', requireRole(['ADMIN']), businessController.backupData);
router.get('/phuc-hoi-du-lieu', requireRole(['ADMIN']), businessController.restoreData);

router.get('/:slug', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), businessController.showBusiness);

module.exports = router;
