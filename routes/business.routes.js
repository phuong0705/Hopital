const express = require('express');
const businessController = require('../controllers/business.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/danh-muc-benh', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), businessController.diseaseCatalog);
router.post('/danh-muc-benh', requireRole(['ADMIN', 'DOCTOR']), businessController.createDisease);
router.post('/danh-muc-benh/:id/status', requireRole(['ADMIN', 'DOCTOR']), businessController.updateDiseaseStatus);
router.get('/danh-muc-thuoc', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), businessController.medicineCatalog);
router.get('/tim-thuoc', requireRole(['ADMIN', 'DOCTOR', 'NURSE']), businessController.searchMedicines);
router.post('/danh-muc-thuoc', requireRole(['ADMIN', 'DOCTOR']), businessController.createMedicine);
router.post('/danh-muc-thuoc/:id/status', requireRole(['ADMIN', 'DOCTOR']), businessController.updateMedicineStatus);
router.get('/danh-muc-dich-vu', requireRole(['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE']), businessController.serviceCatalog);
router.post('/danh-muc-dich-vu', requireRole(['ADMIN', 'RECEPTIONIST']), businessController.createService);
router.post('/danh-muc-dich-vu/:id/status', requireRole(['ADMIN', 'RECEPTIONIST']), businessController.updateServiceStatus);
router.get('/bieu-mau', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), businessController.formTemplates);

// Examination Module
router.get('/lap-phieu-kham', requireRole(['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE']), businessController.examTicket);
router.post('/lap-phieu-kham', requireRole(['ADMIN', 'RECEPTIONIST']), businessController.createExamTicket);
router.get('/chan-benh', requireRole(['ADMIN', 'DOCTOR']), businessController.diagnosis);
router.get('/chi-dinh-cdha-thu-thuat', requireRole(['ADMIN', 'DOCTOR']), businessController.imagingProcedureOrders);
router.get('/tra-cuu-du-lieu-kham', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), businessController.clinicalLookup);
router.get('/theo-doi-ket-qua-kham', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), businessController.examResults);
router.get('/theo-doi-thoi-gian-nam', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), businessController.lengthOfStay);

// Treatment Module
router.get('/lap-phac-do', requireRole(['ADMIN', 'DOCTOR']), businessController.carePlan);
router.get('/lich-mo-thu-thuat', requireRole(['ADMIN', 'DOCTOR']), businessController.procedureSchedule);
router.get('/tong-hop-ket-qua-xet-nghiem', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'LAB']), businessController.labSummary);
router.get('/tiep-nhan-kham-benh', requireRole(['DOCTOR']), businessController.doctorReceptionExam);
router.get('/tai-kham', requireRole(['DOCTOR']), businessController.doctorTodayAppointments);
router.get('/lich-hen-kham-hom-nay', requireRole(['ADMIN', 'DOCTOR']), businessController.doctorTodayAppointments);
router.post('/lich-hen-kham-hom-nay/:id/status', requireRole(['DOCTOR']), businessController.updateDoctorAppointmentStatus);
router.get('/phieu-kham-cho', requireRole(['ADMIN', 'DOCTOR']), businessController.pendingExamTickets);
router.get('/quan-ly-dieu-duong', requireRole(['DOCTOR']), businessController.doctorNurseManagement);
router.post('/quan-ly-dieu-duong/phan-cong', requireRole(['DOCTOR']), businessController.assignDoctorNurse);
router.post('/quan-ly-dieu-duong/:id/ngung-phu-trach', requireRole(['DOCTOR']), businessController.stopDoctorNurseAssignment);
router.get('/xu-tri-sau-kham', requireRole(['ADMIN', 'DOCTOR']), businessController.finalAction);
router.post('/xu-tri-sau-kham/nhap-vien', requireRole(['ADMIN', 'DOCTOR']), businessController.requestFinalAdmission);
router.post('/xu-tri-sau-kham/ke-don', requireRole(['ADMIN', 'DOCTOR']), businessController.createFinalPrescription);
router.post('/xu-tri-sau-kham/ra-vien', requireRole(['ADMIN', 'DOCTOR']), businessController.createFinalDischarge);
router.post('/xu-tri-sau-kham/chuyen-vien', requireRole(['ADMIN', 'DOCTOR']), businessController.createFinalTransfer);

// Nursing Module
router.get('/theo-doi-sinh-hieu', requireRole(['ADMIN', 'NURSE']), businessController.nurseVitals);
router.post('/theo-doi-sinh-hieu', requireRole(['ADMIN', 'NURSE']), businessController.saveNurseVitals);
router.get('/ghi-chu-dieu-duong', requireRole(['ADMIN', 'NURSE']), businessController.nurseNotes);
router.post('/ghi-chu-dieu-duong', requireRole(['ADMIN', 'NURSE']), businessController.saveNurseNote);
router.get('/cap-nhat-trang-thai-phong', requireRole(['ADMIN', 'NURSE']), businessController.roomStatusUpdate);
router.post('/cap-nhat-trang-thai-phong/:id/status', requireRole(['ADMIN', 'NURSE']), businessController.updateBedStatus);
router.get('/quan-ly-thuoc-tai-khoa', requireRole(['ADMIN', 'NURSE']), businessController.wardMeds);
router.get('/quan-ly-thuoc-tai-khoa/:id/history', requireRole(['ADMIN', 'NURSE']), businessController.medicineHistory);
router.post('/quan-ly-thuoc-tai-khoa/transaction', requireRole(['ADMIN', 'NURSE']), businessController.addMedicineTransaction);
router.post('/quan-ly-thuoc-tai-khoa/provision', requireRole(['ADMIN', 'NURSE']), businessController.createMedicineProvision);
router.get('/vat-tu-tieu-hao', requireRole(['ADMIN', 'NURSE']), businessController.supplies);
router.post('/vat-tu-tieu-hao/transaction', requireRole(['ADMIN', 'NURSE']), businessController.addSupplyTransaction);

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
router.post('/sao-luu-du-lieu', requireRole(['ADMIN']), businessController.createBackup);
router.get('/phuc-hoi-du-lieu', requireRole(['ADMIN']), businessController.restoreData);

router.get('/:slug', requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), businessController.showBusiness);

module.exports = router;
