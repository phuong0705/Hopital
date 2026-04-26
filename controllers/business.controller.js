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
const examRepository = require('../repositories/exam.repository');
const supplyRepository = require('../repositories/supply.repository');
const backupRepository = require('../repositories/backup.repository');
const cashierRepository = require('../repositories/cashier.repository');

function containsKeyword(value, keywords) {
  const normalized = normalizeText(value);
  return keywords.some((keyword) => normalized.includes(normalizeText(keyword)));
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function statusEquals(value, expected) {
  return normalizeText(value) === normalizeText(expected);
}

function priorityRank(value) {
  const normalized = normalizeText(value);
  if (normalized === 'nguy cap') return 0;
  if (normalized === 'cao') return 1;
  if (normalized === 'trung binh') return 2;
  return 3;
}

async function getSessionDoctor(req) {
  if (!req.session.user || req.session.user.roleCode !== 'DOCTOR') return null;
  return moduleRepository.getDoctorByUser(req.session.user.fullName);
}

async function getSessionDoctorId(req) {
  const doctor = await getSessionDoctor(req);
  return doctor ? doctor.doctorId : -1;
}

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
    const [patients, departments, doctors, tickets] = await Promise.all([
      patientRepository.getInpatients(),
      lookupRepository.getDepartments(),
      lookupRepository.getDoctors(),
      examRepository.getRecentExamTickets()
    ]);

    res.render('business/exam-ticket', {
      title: 'Lập phiếu khám',
      activeMenu: req.query.activeMenu || 'exam-ticket',
      patients,
      departments,
      doctors,
      tickets,
      selectedPatientId: req.query.patientId,
      initialReason: req.query.reason
    });
  } catch (error) {
    next(error);
  }
}

async function createExamTicket(req, res, next) {
  try {
    const { patientId, departmentId, doctorId, reason } = req.body;
    if (!patientId || !departmentId || !doctorId || !reason) {
      req.flash('error', 'Vui lòng nhập đầy đủ bệnh nhân, khoa khám, bác sĩ và lý do khám.');
      return res.redirect('/nghiep-vu/lap-phieu-kham');
    }

    const ticket = await examRepository.createExamTicket(req.body, req.session.user.userId);
    req.flash('success', `Đã lập phiếu khám ${ticket.ticketCode}.`);
    res.redirect('/nghiep-vu/lap-phieu-kham');
  } catch (error) {
    next(error);
  }
}

async function diagnosis(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    // If it's a doctor, only show their patients. If ADMIN/others (doctorId -1), show all (pass null).
    const rows = await moduleRepository.getMedicalRecords(doctorId === -1 ? null : doctorId);
    
    res.render('business/diagnosis', {
      title: 'Chẩn bệnh',
      activeMenu: req.query.activeMenu || 'diagnosis',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function doctorHandoff(req, res, next) {
  try {
    const doctor = await getSessionDoctor(req);
    if (!doctor) {
      return res.status(404).render('errors/404', {
        title: 'Không tìm thấy phiên bác sĩ',
        activeMenu: req.query.activeMenu || 'doctor-handoff'
      });
    }

    const [patients, activeRecords, labs, treatments, dutyRows] = await Promise.all([
      patientRepository.getInpatients({ doctorId: doctor.doctorId }),
      moduleRepository.getActiveMedicalRecords(doctor.doctorId),
      moduleRepository.getLabTests(doctor.doctorId),
      moduleRepository.getTreatments(doctor.doctorId),
      moduleRepository.getDoctorDuties()
    ]);

    const pendingLabs = labs.filter((row) => !statusEquals(row.status, 'Đã có kết quả'));
    const pendingTreatments = treatments.filter((row) => !statusEquals(row.status, 'Hoàn thành'));
    const procedureKeywords = ['thủ thuật', 'mổ', 'phẫu thuật', 'can thiệp', 'nội soi', 'đặt', 'rút', 'chọc', 'dẫn lưu'];
    const pendingProcedures = pendingTreatments.filter((row) => containsKeyword(row.treatmentContent, procedureKeywords));
    const urgentPatients = patients.filter((row) => priorityRank(row.priorityLevel) <= 1);
    const dischargeQueue = patients.filter((row) => statusEquals(row.status, 'Chờ xuất viện'));
    const recordByPatientCode = new Map(activeRecords.map((row) => [row.patientCode, row]));

    const labCountByPatient = pendingLabs.reduce((map, row) => {
      const key = row.patientCode || row.patientName;
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map());

    const treatmentCountByPatient = pendingTreatments.reduce((map, row) => {
      const key = row.patientCode || row.patientName;
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map());

    const nextTaskByPatient = pendingTreatments.reduce((map, row) => {
      const key = row.patientCode || row.patientName;
      if (!map.has(key)) map.set(key, row);
      return map;
    }, new Map());

    const handoffRows = patients
      .map((patient) => {
        const record = recordByPatientCode.get(patient.patientCode);
        const nextTask = nextTaskByPatient.get(patient.patientCode || patient.fullName);
        const pendingLabCount = labCountByPatient.get(patient.patientCode || patient.fullName) || 0;
        const pendingTreatmentCount = treatmentCountByPatient.get(patient.patientCode || patient.fullName) || 0;
        const flags = [];

        if (priorityRank(patient.priorityLevel) <= 1) flags.push('Theo dõi sát');
        if (statusEquals(patient.status, 'Chờ xuất viện')) flags.push('Chuẩn bị hoàn tất hồ sơ');
        if (pendingLabCount) flags.push(`${pendingLabCount} CLS chờ kết quả`);
        if (pendingTreatmentCount) flags.push(`${pendingTreatmentCount} y lệnh chưa xong`);

        return {
          ...patient,
          recordId: record ? record.recordId : null,
          recordCode: record ? record.recordCode : null,
          pendingLabCount,
          pendingTreatmentCount,
          nextTask: nextTask ? nextTask.treatmentContent : '',
          flags,
          handoffState: statusEquals(patient.status, 'Chờ xuất viện')
            ? 'Chờ chốt xuất viện'
            : priorityRank(patient.priorityLevel) <= 1
              ? 'Ưu tiên cao'
              : pendingLabCount || pendingTreatmentCount
                ? 'Còn việc cần theo dõi'
                : 'Ổn định'
        };
      })
      .sort((left, right) => {
        const byPriority = priorityRank(left.priorityLevel) - priorityRank(right.priorityLevel);
        if (byPriority !== 0) return byPriority;
        if (left.pendingLabCount !== right.pendingLabCount) return right.pendingLabCount - left.pendingLabCount;
        if (left.pendingTreatmentCount !== right.pendingTreatmentCount) return right.pendingTreatmentCount - left.pendingTreatmentCount;
        return new Date(right.admissionDate).getTime() - new Date(left.admissionDate).getTime();
      });

    const departmentTeam = dutyRows.filter((row) => row.departmentName === doctor.departmentName);
    const sameShiftTeam = departmentTeam.filter((row) => row.shiftName === doctor.shiftName);
    const crossShiftTeam = departmentTeam.filter((row) => row.shiftName !== doctor.shiftName);
    const summaryText = [
      `Ca trực tại ${doctor.departmentName || 'khoa'} (${doctor.shiftName || 'ca hiện tại'}) hiện có ${patients.length} bệnh nhân bàn giao.`,
      urgentPatients.length > 0 ? `Trong đó có ${urgentPatients.length} ca cần theo dõi sát.` : 'Tình trạng chung các bệnh nhân ổn định.',
      pendingLabs.length > 0 ? `Còn ${pendingLabs.length} kết quả cận lâm sàng đang chờ.` : 'Các chỉ định cận lâm sàng đã hoàn tất.',
      pendingTreatments.length > 0 ? `Đang thực hiện ${pendingTreatments.length} y lệnh/thủ thuật tồn.` : 'Không có y lệnh tồn đọng.',
      dischargeQueue.length > 0 ? `Có ${dischargeQueue.length} hồ sơ đang làm thủ tục xuất viện.` : ''
    ].filter(Boolean).join(' ');

    return res.render('business/doctor-handoff', {
      title: 'Giao ban điện tử',
      activeMenu: req.query.activeMenu || 'doctor-handoff',
      doctor,
      summaryText,
      handoffRows,
      urgentPatients,
      pendingLabs,
      pendingTreatments,
      pendingProcedures,
      dischargeQueue,
      sameShiftTeam,
      crossShiftTeam
    });
  } catch (error) {
    return next(error);
  }
}

async function imagingProcedureOrders(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const [services, activeRecords, orders] = await Promise.all([
      serviceRepository.getServices(),
      moduleRepository.getActiveMedicalRecords(doctorId),
      moduleRepository.getLabTests(doctorId)
    ]);

    const serviceKeywords = ['chẩn đoán hình ảnh', 'cdha', 'thủ thuật', 'x-quang', 'siêu âm', 'ct', 'mri', 'nội soi'];
    const orderKeywords = ['x-quang', 'siêu âm', 'ct', 'mri', 'nội soi', 'can thiệp', 'thủ thuật'];

    const serviceRows = services.filter((row) =>
      containsKeyword([row.serviceGroup, row.serviceName, row.departmentName].join(' '), serviceKeywords)
    );
    const orderRows = orders.filter((row) =>
      containsKeyword(row.testType, orderKeywords)
    );

    return res.render('business/imaging-procedure-orders', {
      title: 'Chỉ định CĐHA / Thủ thuật',
      activeMenu: req.query.activeMenu || 'doctor-imaging-procedure-order',
      serviceRows,
      activeRecords,
      orderRows
    });
  } catch (error) {
    return next(error);
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
    const doctorId = await getSessionDoctorId(req);
    const rows = await moduleRepository.getLabTests(doctorId === -1 ? null : doctorId);
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
    const doctorId = await getSessionDoctorId(req);
    const rows = await moduleRepository.getLengthOfStay(doctorId === -1 ? null : doctorId);
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
    const doctorId = await getSessionDoctorId(req);
    const rows = await moduleRepository.getMedicalRecords(doctorId === -1 ? null : doctorId);
    res.render('business/care-plan', {
      title: 'Lập phác đồ',
      activeMenu: req.query.activeMenu || 'care-plan',
      rows
    });
  } catch (error) {
    next(error);
  }
}


async function procedureSchedule(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const selectedDoctor = doctorId ? await moduleRepository.getDoctorByUser(req.session.user.fullName) : null;
    const rows = doctorId ? await moduleRepository.getTreatments(doctorId) : [];
    const procedureKeywords = ['thủ thuật', 'mổ', 'phẫu thuật', 'can thiệp', 'nội soi', 'đặt', 'rút', 'chọc', 'dẫn lưu'];

    const procedureRows = rows.filter((row) => containsKeyword(row.treatmentContent, procedureKeywords));

    return res.render('business/procedure-schedule', {
      title: 'Lịch mổ / Thủ thuật',
      activeMenu: req.query.activeMenu || 'doctor-procedure-schedule',
      selectedDoctor,
      procedureRows,
      supportRows: procedureRows.length ? rows : rows.slice(0, 6)
    });
  } catch (error) {
    return next(error);
  }
}

async function labSummary(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const rows = await moduleRepository.getLabTests(doctorId === -1 ? null : doctorId);
    res.render('business/lab-summary', {
      title: 'Tổng hợp kết quả xét nghiệm',
      activeMenu: req.query.activeMenu || 'lab-summary',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function doctorTodayAppointments(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const rows = await cashierRepository.getAppointmentsByDoctor(doctorId === -1 ? 0 : doctorId);
    
    res.render('business/doctor-appointments', {
      title: 'Lịch hẹn khám hôm nay',
      activeMenu: req.query.activeMenu || 'doctor-today-appointments',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function pendingExamTickets(req, res, next) {
  try {
    const doctor = await getSessionDoctor(req);
    if (!doctor) {
      req.flash('error', 'Không tìm thấy hồ sơ bác sĩ.');
      return res.redirect('/dashboard');
    }

    const rows = await examRepository.getRecentExamTickets(100);
    // Filter for tickets assigned to this doctor and still in 'Đã lập phiếu' status
    const pendingTickets = rows.filter(t => 
      t.status === 'Đã lập phiếu' && 
      t.doctorName === doctor.fullName
    );

    res.render('business/pending-tickets', {
      title: 'Danh sách phiếu khám chờ',
      activeMenu: req.query.activeMenu || 'doctor-pending-tickets',
      rows: pendingTickets
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
    const [rows, shiftStats] = await Promise.all([
      moduleRepository.getDoctorDuties(),
      moduleRepository.getDutyShiftStats()
    ]);
    res.render('business/duty-shift', {
      title: 'Quản lý ca trực',
      activeMenu: req.query.activeMenu || 'duty-shift',
      rows,
      shiftStats
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
    const { startDate, endDate } = req.query;
    const rows = await moduleRepository.getVisitStats({ startDate, endDate });
    res.render('business/report-visits', {
      title: 'Thống kê lượt khám',
      activeMenu: req.query.activeMenu || 'report-visits',
      rows,
      filters: { startDate, endDate }
    });
  } catch (error) {
    return next(error);
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
    const { startDate, endDate } = req.query;
    const rows = await moduleRepository.getDischarges(null, { startDate, endDate });
    res.render('business/report-discharges', {
      title: 'Báo cáo xuất viện',
      activeMenu: req.query.activeMenu || 'report-discharges',
      rows,
      filters: { startDate, endDate }
    });
  } catch (error) {
    return next(error);
  }
}


async function backupData(req, res, next) {
  try {
    const rows = await backupRepository.getBackupJobs();
    res.render('business/backup', {
      title: 'Sao lưu dữ liệu',
      activeMenu: req.query.activeMenu || 'backup-data',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function createBackup(req, res, next) {
  try {
    const job = await backupRepository.createBackupJob(req.body, req.session.user.userId);
    req.flash('success', `Đã ghi nhận bản sao lưu ${job.backupCode}.`);
    return res.redirect('/nghiep-vu/sao-luu-du-lieu');
  } catch (error) {
    return next(error);
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

// Nursing Module Logic
async function nurseHandoff(req, res, next) {
  try {
    const patients = await patientRepository.getInpatients();
    const dutyRows = await moduleRepository.getDoctorDuties();
    const departmentTeam = dutyRows.filter((row) => row.departmentName === (req.session.user.departmentName || 'Khoa Nội tổng hợp'));
    
    res.render('business/nurse-handoff', {
      title: 'Giao ban điều dưỡng',
      activeMenu: req.query.activeMenu || 'nurse-handoff',
      patients,
      departmentTeam,
      summaryText: `Ca trực hiện có ${patients.length} bệnh nhân nội trú cần theo dõi và chăm sóc.`
    });
  } catch (error) {
    next(error);
  }
}

async function nurseVitals(req, res, next) {
  try {
    const rows = await patientRepository.getInpatients();
    res.render('business/nurse-vitals', {
      title: 'Theo dõi sinh hiệu',
      activeMenu: req.query.activeMenu || 'nurse-vitals',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function saveNurseVitals(req, res, next) {
  try {
    const { admissionId, pulse, temperature, bp, respiratory } = req.body;
    const vitalsString = `Mạch: ${pulse} l/p, T°: ${temperature} °C, HA: ${bp} mmHg, NT: ${respiratory} l/p`;
    await moduleRepository.updateNurseVitals(admissionId, vitalsString);
    req.flash('success', 'Cập nhật sinh hiệu bệnh nhân thành công.');
    res.redirect('/nghiep-vu/theo-doi-sinh-hieu');
  } catch (error) {
    next(error);
  }
}

async function nurseNotes(req, res, next) {
  try {
    const rows = await patientRepository.getInpatients();
    res.render('business/nurse-notes', {
      title: 'Ghi chú điều dưỡng',
      activeMenu: req.query.activeMenu || 'nurse-notes',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function saveNurseNote(req, res, next) {
  try {
    const { admissionId, note } = req.body;
    await moduleRepository.updateNurseNotes(admissionId, note);
    req.flash('success', 'Đã lưu ghi chú diễn biến chăm sóc.');
    res.redirect('/nghiep-vu/ghi-chu-dieu-duong');
  } catch (error) {
    next(error);
  }
}

async function roomStatusUpdate(req, res, next) {
  try {
    const rows = await moduleRepository.getBeds();
    res.render('business/room-status', {
      title: 'Cập nhật trạng thái phòng',
      activeMenu: req.query.activeMenu || 'nurse-room-status',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function updateBedStatus(req, res, next) {
  try {
    await moduleRepository.updateBedStatus(req.params.id, req.body.status);
    req.flash('success', 'Cập nhật trạng thái giường thành công.');
    res.redirect('/nghiep-vu/cap-nhat-trang-thai-phong');
  } catch (error) {
    next(error);
  }
}

async function wardMeds(req, res, next) {
  try {
    const rows = await medicineRepository.getMedicines();
    res.render('business/ward-meds', {
      title: 'Quản lý thuốc tại khoa',
      activeMenu: req.query.activeMenu || 'nurse-meds',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function medicineHistory(req, res, next) {
  try {
    const history = await medicineRepository.getMedicineHistory(req.params.id);
    res.json(history);
  } catch (error) {
    next(error);
  }
}

async function addMedicineTransaction(req, res, next) {
  try {
    const { medicineId, transactionType, quantity, note } = req.body;
    await medicineRepository.addInventoryTransaction({
      medicineId: Number(medicineId),
      transactionType,
      quantity: Number(quantity),
      performedBy: req.session.user.userId,
      note
    });
    req.flash('success', `${transactionType} thành công.`);
    res.redirect('/nghiep-vu/quan-ly-thuoc-tai-khoa');
  } catch (error) {
    next(error);
  }
}

async function createMedicineProvision(req, res, next) {
  try {
    const request = await medicineRepository.createProvisionRequest({
      departmentName: req.session.user.departmentName || req.body.departmentName || '',
      note: req.body.note || '',
      createdBy: req.session.user.userId
    });
    req.flash('success', `Đã gửi yêu cầu dự trù ${request.requestCode}.`);
    res.redirect('/nghiep-vu/quan-ly-thuoc-tai-khoa');
  } catch (error) {
    next(error);
  }
}

async function supplies(req, res, next) {
  try {
    const rows = await supplyRepository.getSupplies();
    res.render('business/supplies', {
      title: 'Vật tư tiêu hao',
      activeMenu: req.query.activeMenu || 'nurse-supplies',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function addSupplyTransaction(req, res, next) {
  try {
    await supplyRepository.addSupplyTransaction(req.body, req.session.user.userId);
    req.flash('success', req.body.transactionType === 'Xuất sử dụng'
      ? 'Đã cập nhật xuất sử dụng vật tư.'
      : 'Đã ghi nhận yêu cầu vật tư.');
    res.redirect('/nghiep-vu/vat-tu-tieu-hao');
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
  createExamTicket,
  diagnosis,
  doctorHandoff,
  imagingProcedureOrders,
  clinicalLookup,
  examResults,
  lengthOfStay,
  carePlan,
  procedureSchedule,
  labSummary,
  doctorTodayAppointments,
  pendingExamTickets,
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
  createBackup,
  restoreData,
  nurseHandoff,
  nurseVitals,
  saveNurseVitals,
  nurseNotes,
  saveNurseNote,
  roomStatusUpdate,
  updateBedStatus,
  wardMeds,
  medicineHistory,
  addMedicineTransaction,
  createMedicineProvision,
  supplies,
  addSupplyTransaction
};
