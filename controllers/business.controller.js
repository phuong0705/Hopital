const {
  businessGroups,
  businessItems,
  canAccessBusinessItem
} = require('../config/business-processes');
const diseaseRepository = require('../repositories/disease.repository');
const medicineRepository = require('../repositories/medicine.repository');
const serviceRepository = require('../repositories/service.repository');
const patientRepository = require('../repositories/patient.repository');
const moduleRepository = require('../repositories/module.repository');
const lookupRepository = require('../repositories/lookup.repository');

function showBusiness(req, res) {
  const item = businessItems.find(entry => entry.slug === req.params.slug);

  if (!item || !canAccessBusinessItem(item, req.session.user.roleCode)) {
    return res.status(404).render('errors/404', {
      title: 'Không tìm thấy nghiệp vụ',
      activeMenu: ''
    });
  }

  const group = businessGroups.find(entry => entry.key === item.groupKey);
  const relatedItems = group.items.filter(entry => entry.key !== item.key);

  return res.render('business/index', {
    title: item.title,
    activeMenu: req.query.activeMenu || item.key,
    item,
    group,
    relatedItems
  });
}

async function diseaseCatalog(req, res, next) {
  try {
    const rows = await diseaseRepository.getDiseases();
    return res.render('business/diseases', {
      title: 'Thư viện bệnh',
      activeMenu: req.query.activeMenu || 'catalog-diseases',
      rows
    });
  } catch (error) {
    return next(error);
  }
}

async function createDisease(req, res, next) {
  try {
    const { diseaseCode, icd10Code, diseaseName, specialty } = req.body;
    if (!diseaseCode || !icd10Code || !diseaseName || !specialty) {
      req.flash('error', 'Vui lòng nhập đầy đủ mã bệnh, mã ICD-10, tên bệnh và chuyên khoa.');
      return res.redirect('/nghiep-vu/danh-muc-benh');
    }

    await diseaseRepository.createDisease(req.body);
    req.flash('success', 'Thêm bệnh vào thư viện thành công.');
    return res.redirect('/nghiep-vu/danh-muc-benh');
  } catch (error) {
    if (error.number === 2627 || error.number === 2601) {
      req.flash('error', 'Mã bệnh đã tồn tại trong thư viện.');
      return res.redirect('/nghiep-vu/danh-muc-benh');
    }
    return next(error);
  }
}

async function updateDiseaseStatus(req, res, next) {
  try {
    await diseaseRepository.updateDiseaseStatus(req.params.id, req.body.status || 'Ngưng sử dụng');
    req.flash('success', 'Cập nhật trạng thái bệnh thành công.');
    return res.redirect('/nghiep-vu/danh-muc-benh');
  } catch (error) {
    return next(error);
  }
}

async function medicineCatalog(req, res, next) {
  try {
    const rows = await medicineRepository.getMedicines();
    return res.render('business/medicines', {
      title: 'Danh mục thuốc',
      activeMenu: req.query.activeMenu || 'catalog-medicines',
      rows
    });
  } catch (error) {
    return next(error);
  }
}

async function createMedicine(req, res, next) {
  try {
    const { medicineCode, medicineName, medicineGroup, dosageForm } = req.body;
    if (!medicineCode || !medicineName || !medicineGroup || !dosageForm) {
      req.flash('error', 'Vui lòng nhập đầy đủ mã thuốc, tên thuốc, nhóm thuốc và dạng bào chế.');
      return res.redirect('/nghiep-vu/danh-muc-thuoc');
    }

    await medicineRepository.createMedicine(req.body);
    req.flash('success', 'Thêm thuốc vào danh mục thành công.');
    return res.redirect('/nghiep-vu/danh-muc-thuoc');
  } catch (error) {
    if (error.number === 2627 || error.number === 2601) {
      req.flash('error', 'Mã thuốc đã tồn tại trong danh mục.');
      return res.redirect('/nghiep-vu/danh-muc-thuoc');
    }
    return next(error);
  }
}

async function updateMedicineStatus(req, res, next) {
  try {
    await medicineRepository.updateMedicineStatus(req.params.id, req.body.status || 'Ngưng sử dụng');
    req.flash('success', 'Cập nhật trạng thái thuốc thành công.');
    return res.redirect('/nghiep-vu/danh-muc-thuoc');
  } catch (error) {
    return next(error);
  }
}

async function serviceCatalog(req, res, next) {
  try {
    const rows = await serviceRepository.getServices();
    return res.render('business/services', {
      title: 'Danh mục dịch vụ',
      activeMenu: req.query.activeMenu || 'catalog-services',
      rows
    });
  } catch (error) {
    return next(error);
  }
}

async function createService(req, res, next) {
  try {
    const { serviceCode, serviceName, serviceGroup } = req.body;
    if (!serviceCode || !serviceName || !serviceGroup) {
      req.flash('error', 'Vui lòng nhập đầy đủ mã dịch vụ, tên dịch vụ và nhóm dịch vụ.');
      return res.redirect('/nghiep-vu/danh-muc-dich-vu');
    }

    await serviceRepository.createService(req.body);
    req.flash('success', 'Thêm dịch vụ vào danh mục thành công.');
    return res.redirect('/nghiep-vu/danh-muc-dich-vu');
  } catch (error) {
    if (error.number === 2627 || error.number === 2601) {
      req.flash('error', 'Mã dịch vụ đã tồn tại trong danh mục.');
      return res.redirect('/nghiep-vu/danh-muc-dich-vu');
    }
    return next(error);
  }
}

async function updateServiceStatus(req, res, next) {
  try {
    await serviceRepository.updateServiceStatus(req.params.id, req.body.status || 'Ngưng sử dụng');
    req.flash('success', 'Cập nhật trạng thái dịch vụ thành công.');
    return res.redirect('/nghiep-vu/danh-muc-dich-vu');
  } catch (error) {
    return next(error);
  }
}
async function examTicket(req, res, next) {
  try {
    const [patients, departments, doctors] = await Promise.all([
      patientRepository.getInpatients(),
      lookupRepository.getDepartments(),
      lookupRepository.getDoctors()
    ]);

    res.render('business/exam-ticket', {
      title: 'Lập phiếu khám',
      activeMenu: req.query.activeMenu || 'exam-ticket',
      patients,
      departments,
      doctors
    });
  } catch (error) {
    next(error);
  }
}

async function diagnosis(req, res, next) {
  try {
    const rows = await moduleRepository.getMedicalRecords();
    res.render('business/diagnosis', {
      title: 'Chẩn bệnh',
      activeMenu: req.query.activeMenu || 'diagnosis',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function clinicalLookup(req, res, next) {
  try {
    const patients = await patientRepository.getInpatients();
    res.render('business/clinical-lookup', {
      title: 'Tra cứu dữ liệu khám',
      activeMenu: req.query.activeMenu || 'clinical-lookup',
      patients
    });
  } catch (error) {
    next(error);
  }
}

async function examResults(req, res, next) {
  try {
    const rows = await moduleRepository.getLabTests();
    res.render('business/exam-results', {
      title: 'Theo dõi kết quả khám',
      activeMenu: req.query.activeMenu || 'exam-results',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function lengthOfStay(req, res, next) {
  try {
    const rows = await moduleRepository.getLengthOfStay();
    res.render('business/length-of-stay', {
      title: 'Theo dõi thời gian nằm viện',
      activeMenu: req.query.activeMenu || 'length-of-stay',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function carePlan(req, res, next) {
  try {
    const rows = await moduleRepository.getActiveMedicalRecords();
    res.render('business/care-plan', {
      title: 'Lập phác đồ điều trị',
      activeMenu: req.query.activeMenu || 'care-plan',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function labSummary(req, res, next) {
  try {
    const rows = await moduleRepository.getLabTests();
    res.render('business/lab-summary', {
      title: 'Tổng hợp kết quả xét nghiệm',
      activeMenu: req.query.activeMenu || 'lab-summary',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function feeExam(req, res, next) {
  try {
    const patients = await patientRepository.getInpatients();
    res.render('business/fee-exam', {
      title: 'Tính phí khám bệnh',
      activeMenu: req.query.activeMenu || 'fee-exam',
      patients
    });
  } catch (error) {
    next(error);
  }
}

async function invoiceList(req, res, next) {
  try {
    const rows = await moduleRepository.getBilling();
    res.render('business/invoices', {
      title: 'Quản lý hóa đơn',
      activeMenu: req.query.activeMenu || 'invoice',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function doctorDuty(req, res, next) {
  try {
    const [rows, departments, allDoctors] = await Promise.all([
      moduleRepository.getDoctorDuties(),
      lookupRepository.getDepartments(),
      lookupRepository.getDoctors()
    ]);
    res.render('business/doctor-duty', {
      title: 'Phân công bác sĩ trực',
      activeMenu: req.query.activeMenu || 'doctor-duty',
      rows,
      departments,
      allDoctors
    });
  } catch (error) {
    next(error);
  }
}

async function dutyShift(req, res, next) {
  try {
    const rows = await moduleRepository.getDoctorDuties(); // Reusing the same data for now
    res.render('business/duty-shift', {
      title: 'Quản lý ca trực',
      activeMenu: req.query.activeMenu || 'duty-shift',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function performance(req, res, next) {
  try {
    const rows = await moduleRepository.getStaffPerformance();
    res.render('business/performance', {
      title: 'Theo dõi hiệu suất',
      activeMenu: req.query.activeMenu || 'performance',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function updateDoctorDuty(req, res, next) {
  try {
    await moduleRepository.updateDoctorDuty(req.params.id, req.body);
    req.flash('success', 'Cập nhật phân công bác sĩ thành công.');
    res.redirect('/nghiep-vu/quan-ly-bac-si-truc');
  } catch (error) {
    next(error);
  }
}

async function createDoctorDuty(req, res, next) {
  try {
    const { doctorId, departmentId, shiftName } = req.body;
    await moduleRepository.updateDoctorDuty(doctorId, { departmentId, shiftName });
    req.flash('success', 'Thêm phân công bác sĩ thành công.');
    res.redirect('/nghiep-vu/quan-ly-bac-si-truc');
  } catch (error) {
    next(error);
  }
}

async function removeDoctorDuty(req, res, next) {
  try {
    await moduleRepository.removeDoctorDuty(req.params.id);
    req.flash('success', 'Đã gỡ phân công bác sĩ.');
    res.redirect('/nghiep-vu/quan-ly-bac-si-truc');
  } catch (error) {
    next(error);
  }
}

async function reportInpatient(req, res, next) {
  try {
    const rows = await moduleRepository.getInpatientStats();
    res.render('business/report-inpatient', {
      title: 'Thống kê bệnh nhân nội trú',
      activeMenu: req.query.activeMenu || 'report-inpatient',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function reportRevenue(req, res, next) {
  try {
    const rows = await moduleRepository.getRevenueStats();
    res.render('business/report-revenue', {
      title: 'Thống kê doanh thu',
      activeMenu: req.query.activeMenu || 'report-revenue',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function reportVisits(req, res, next) {
  try {
    const rows = await moduleRepository.getVisitStats();
    res.render('business/report-visits', {
      title: 'Thống kê lượt khám',
      activeMenu: req.query.activeMenu || 'report-visits',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function reportMedicines(req, res, next) {
  try {
    const rows = await moduleRepository.getMedicineUsageStats();
    res.render('business/report-medicines', {
      title: 'Thống kê sử dụng thuốc',
      activeMenu: req.query.activeMenu || 'report-medicines',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function reportDischarges(req, res, next) {
  try {
    const rows = await moduleRepository.getDischarges();
    res.render('business/report-discharges', {
      title: 'Báo cáo xuất viện',
      activeMenu: req.query.activeMenu || 'report-discharges',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function backupData(req, res, next) {
  try {
    res.render('business/backup', {
      title: 'Sao lưu dữ liệu',
      activeMenu: req.query.activeMenu || 'backup-data'
    });
  } catch (error) {
    next(error);
  }
}

async function restoreData(req, res, next) {
  try {
    res.render('business/restore', {
      title: 'Phục hồi dữ liệu',
      activeMenu: req.query.activeMenu || 'restore-data'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  showBusiness,
  diseaseCatalog,
  createDisease,
  updateDiseaseStatus,
  medicineCatalog,
  createMedicine,
  updateMedicineStatus,
  serviceCatalog,
  createService,
  updateServiceStatus,
  examTicket,
  diagnosis,
  clinicalLookup,
  examResults,
  lengthOfStay,
  carePlan,
  labSummary,
  feeExam,
  invoiceList,
  doctorDuty,
  dutyShift,
  performance,
  updateDoctorDuty,
  createDoctorDuty,
  removeDoctorDuty,
  reportInpatient,
  reportRevenue,
  reportVisits,
  reportMedicines,
  reportDischarges,
  backupData,
  restoreData
};
