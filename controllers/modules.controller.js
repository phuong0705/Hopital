const moduleRepository = require('../repositories/module.repository');

const adminRepository = require('../repositories/admin.repository');

function makeListAction(options) {
  return async (req, res, next) => {
    try {
      const rows = await moduleRepository[options.repositoryMethod]();
      res.render(options.view, {
        title: options.title,
        activeMenu: req.query.activeMenu || options.activeMenu,
        rows
      });
    } catch (error) {
      next(error);
    }
  };
}

async function getSessionDoctorId(req) {
  if (!req.session.user || req.session.user.roleCode !== 'DOCTOR') return null;
  const doctor = await moduleRepository.getDoctorByUser(req.session.user);
  return doctor ? doctor.doctorId : -1;
}

async function medicalRecords(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const rows = await moduleRepository.getMedicalRecords(doctorId);
    const completionRows = rows.map((row) => {
      const missingItems = [];
      if (Number(row.pendingLabCount || 0) > 0) missingItems.push(`${row.pendingLabCount} CLS chưa có kết quả`);
      if (Number(row.pendingTreatmentCount || 0) > 0) missingItems.push(`${row.pendingTreatmentCount} y lệnh chưa hoàn thành`);
      if (!row.dischargeId && !['Chờ xuất viện', 'Đã xuất viện'].includes(row.admissionStatus)) {
        missingItems.push('Chưa có quyết định ra viện/chuyển viện');
      }
      if (!row.diagnosis) missingItems.push('Thiếu chẩn đoán');

      const isCompleted = row.status === 'Hoàn tất';
      const isReady = !isCompleted && missingItems.length === 0;

      return {
        ...row,
        missingItems,
        completionState: isCompleted ? 'Đã hoàn tất' : (isReady ? 'Sẵn sàng hoàn tất' : 'Cần bổ sung')
      };
    });

    const stats = {
      total: completionRows.length,
      completed: completionRows.filter((row) => row.completionState === 'Đã hoàn tất').length,
      ready: completionRows.filter((row) => row.completionState === 'Sẵn sàng hoàn tất').length,
      pending: completionRows.filter((row) => row.completionState === 'Cần bổ sung').length
    };

    res.render('medical-records/index', {
      title: 'Hoàn tất hồ sơ bệnh án',
      activeMenu: req.query.activeMenu || (req.session.user.roleCode === 'DOCTOR' ? 'doctor-medical-records' : 'medical-records'),
      rows: completionRows,
      stats,
      canCompleteRecord: req.session.user && ['ADMIN', 'DOCTOR'].includes(req.session.user.roleCode)
    });
  } catch (error) {
    next(error);
  }
}

async function completeMedicalRecord(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    await moduleRepository.completeMedicalRecord(req.params.id, doctorId);
    req.flash('success', 'Đã hoàn tất hồ sơ bệnh án.');
    const returnTo = req.body.returnTo || '/medical-records?activeMenu=doctor-medical-records';
    return res.redirect(returnTo.startsWith('/') ? returnTo : '/medical-records?activeMenu=doctor-medical-records');
  } catch (error) {
    if (error.number === 51008 || error.number === 51007) {
      req.flash('error', error.message);
      return res.redirect('/medical-records?activeMenu=doctor-medical-records');
    }
    return next(error);
  }
}

async function medicalRecordDetail(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const data = await moduleRepository.getMedicalRecordDetail(req.params.id, doctorId);
    if (!data.record) {
      return res.status(404).render('errors/404', { title: 'Không tìm thấy', activeMenu: 'medical-records' });
    }

    return res.render('medical-records/detail', {
      title: `Hồ sơ ${data.record.record_code}`,
      activeMenu: req.query.activeMenu || (req.session.user.roleCode === 'DOCTOR' ? 'doctor-medical-records' : 'medical-records'),
      data
    });
  } catch (error) {
    return next(error);
  }
}

async function settings(req, res, next) {
  try {
    const [counts, realtime] = await Promise.all([
      adminRepository.getSystemCounts(),
      adminRepository.getRealtimeMetrics()
    ]);

    return res.render('settings/index', {
      title: 'Cài đặt hệ thống',
      activeMenu: req.query.activeMenu || 'settings',
      counts,
      realtime,
      env: {
        nodeEnv: process.env.NODE_ENV || 'development',
        reportsFrontendUrl: process.env.REPORTS_FRONTEND_URL || '',
        reportsApiBaseUrl: process.env.REPORTS_API_BASE_URL || '',
        sessionSecretConfigured: Boolean(process.env.SESSION_SECRET)
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function nursing(req, res, next) {
  try {
    const rows = await moduleRepository.getNursingWorklist();
    res.render('nursing/index', {
      title: 'Điều dưỡng',
      activeMenu: req.query.activeMenu || 'nursing',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function beds(req, res, next) {
  try {
    const [rows, activeAdmissions, availableBeds] = await Promise.all([
      moduleRepository.getBeds(),
      moduleRepository.getActiveAdmissions(),
      moduleRepository.getAvailableBeds()
    ]);

    res.render('beds/index', {
      title: 'Quản lí giường bệnh',
      activeMenu: req.query.activeMenu || 'beds',
      rows,
      activeAdmissions,
      availableBeds
    });
  } catch (error) {
    next(error);
  }
}

async function transferBed(req, res, next) {
  try {
    await moduleRepository.transferBed(req.body);
    req.flash('success', 'Chuyển phòng / giường thành công.');
    res.redirect('/beds');
  } catch (error) {
    next(error);
  }
}

async function billing(req, res, next) {
  try {
    const [rows, activeAdmissions] = await Promise.all([
      moduleRepository.getBilling(),
      moduleRepository.getActiveAdmissions()
    ]);

    res.render('billing/index', {
      title: 'Viện phí / thanh toán',
      activeMenu: req.query.activeMenu || 'billing',
      rows,
      activeAdmissions
    });
  } catch (error) {
    next(error);
  }
}

async function createBilling(req, res, next) {
  try {
    await moduleRepository.createBilling(req.body);
    req.flash('success', 'Lập phiếu thu thành công.');
    res.redirect('/billing');
  } catch (error) {
    next(error);
  }
}

async function discharges(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const [rows, activeAdmissions] = await Promise.all([
      moduleRepository.getDischarges(doctorId),
      moduleRepository.getActiveAdmissions(doctorId)
    ]);

    res.render('discharges/index', {
      title: 'Xuất viện',
      activeMenu: req.query.activeMenu || 'discharges',
      rows,
      activeAdmissions
    });
  } catch (error) {
    next(error);
  }
}

async function createDischarge(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    await moduleRepository.createDischarge(req.body, doctorId);
    req.flash('success', 'Tạo hồ sơ xuất viện thành công.');
    res.redirect('/discharges');
  } catch (error) {
    next(error);
  }
}

async function updateTreatmentStatus(req, res, next) {
  try {
    await moduleRepository.updateTreatmentStatus(req.params.id, req.body);
    req.flash('success', 'Cập nhật y lệnh thành công.');
    res.redirect('/treatments');
  } catch (error) {
    next(error);
  }
}

async function treatments(req, res, next) {
  try {
    const roleCode = req.session.user ? req.session.user.roleCode : '';
    const isDoctor = roleCode === 'DOCTOR';
    let selectedDoctor = null;
    let selectedDoctorId = req.query.doctorId ? Number(req.query.doctorId) : null;
    let doctors = [];

    if (isDoctor) {
      selectedDoctor = await moduleRepository.getDoctorByUser(req.session.user);
      selectedDoctorId = selectedDoctor ? selectedDoctor.doctorId : null;
    } else {
      doctors = await moduleRepository.getTreatmentDoctorsOverview();
      if (!selectedDoctorId && doctors.length) {
        selectedDoctorId = doctors[0].doctorId;
      }
      selectedDoctor = doctors.find((doctor) => Number(doctor.doctorId) === Number(selectedDoctorId)) || doctors[0] || null;
    }

    const rows = selectedDoctorId ? await moduleRepository.getTreatments(selectedDoctorId) : [];

    res.render('treatments/index', {
      title: 'Lịch điều trị',
      activeMenu: req.query.activeMenu || 'treatments',
      rows,
      doctors,
      selectedDoctor,
      selectedDoctorId,
      isDoctor
    });
  } catch (error) {
    next(error);
  }
}

async function prescriptions(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const activeMenu = req.query.activeMenu || 'prescriptions';
    const [rows, activeRecords, doctors] = await Promise.all([
      moduleRepository.getPrescriptions(doctorId),
      moduleRepository.getActiveMedicalRecords(doctorId),
      doctorId ? Promise.resolve([]) : moduleRepository.getDoctors()
    ]);
    const selectedDoctor = doctorId ? await moduleRepository.getDoctorByUser(req.session.user) : null;

    res.render('prescriptions/index', {
      title: activeMenu === 'doctor-prescription-history' ? 'Lịch sử đơn thuốc' : 'Thuốc và đơn thuốc',
      activeMenu,
      rows,
      activeRecords,
      doctors,
      selectedDoctor,
      showPrescribeAction: activeMenu !== 'doctor-prescription-history'
    });
  } catch (error) {
    next(error);
  }
}

async function createPrescription(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    await moduleRepository.createPrescription(req.body, doctorId);
    req.flash('success', 'Kê đơn thuốc thành công.');
    res.redirect('/prescriptions');
  } catch (error) {
    if (error.message && error.message.startsWith('Vui lòng')) {
      req.flash('error', error.message);
      return res.redirect('/prescriptions');
    }
    next(error);
  }
}

async function labtests(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const [rows, activeRecords] = await Promise.all([
      moduleRepository.getLabTests(doctorId),
      moduleRepository.getMedicalRecords(doctorId)
    ]);
    res.render('labtests/index', {
      title: 'Xét nghiệm / cận lâm sàng',
      activeMenu: req.query.activeMenu || 'labtests',
      rows,
      activeRecords
    });
  } catch (error) {
    next(error);
  }
}

async function createLabTest(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const { recordId, testType } = req.body;

    if (!recordId || !testType) {
      req.flash('error', 'Vui lòng chọn hồ sơ bệnh án và nhập loại xét nghiệm.');
      return res.redirect('/labtests?activeMenu=doctor-lab-orders');
    }

    await moduleRepository.createLabTest(req.body, doctorId);
    req.flash('success', 'Đã tạo chỉ định xét nghiệm.');
    return res.redirect('/labtests?activeMenu=doctor-lab-orders');
  } catch (error) {
    return next(error);
  }
}

async function updateLabTestResult(req, res, next) {
  try {
    const { testCode } = req.params;
    const { status, resultSummary } = req.body;
    const uploadedFiles = (req.files || []).map((file) => ({
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/lab-results/${file.filename}`,
      uploadedAt: new Date().toISOString()
    }));

    if (!status || !resultSummary) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ trạng thái và kết quả/kết luận' });
    }

    let resultFiles = null;
    if (uploadedFiles.length) {
      const currentLabTest = await moduleRepository.getLabTestByCode(testCode);
      if (!currentLabTest) {
        return res.status(404).json({ error: 'Không tìm thấy chỉ định xét nghiệm' });
      }

      let currentFiles = [];
      try {
        currentFiles = currentLabTest.resultFilesJson ? JSON.parse(currentLabTest.resultFilesJson) : [];
      } catch (error) {
        currentFiles = [];
      }
      resultFiles = [...currentFiles, ...uploadedFiles];
    }

    await moduleRepository.updateLabTestResult(testCode, status, resultSummary, resultFiles);
    res.json({ success: true, message: 'Cập nhật kết quả thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật kết quả xét nghiệm:', error);
    res.status(500).json({ error: 'Không thể cập nhật kết quả xét nghiệm' });
  }
}

async function departmentDetail(req, res, next) {
  try {
    const departmentId = req.params.id;
    const [department, rooms, beds, patients, staff] = await Promise.all([
      moduleRepository.getDepartmentDetail(departmentId),
      moduleRepository.getDepartmentRooms(departmentId),
      moduleRepository.getDepartmentBeds(departmentId),
      moduleRepository.getDepartmentPatients(departmentId),
      moduleRepository.getDepartmentStaff(departmentId)
    ]);

    if (!department) return res.status(404).render('errors/404', { title: 'Không tìm thấy', activeMenu: 'departments' });

    res.render('departments/detail', {
      title: `Khoa ${department.departmentName}`,
      activeMenu: req.query.activeMenu || 'departments',
      department,
      rooms,
      beds,
      patients,
      staff
    });
  } catch (error) {
    next(error);
  }
}

async function createRoom(req, res, next) {
  try {
    await moduleRepository.createRoom(req.body);
    req.flash('success', 'Thêm phòng mới thành công.');
    res.redirect(`/departments/${req.body.departmentId}`);
  } catch (error) {
    next(error);
  }
}

async function updateRoom(req, res, next) {
  try {
    await moduleRepository.updateRoom(req.params.id, req.body);
    req.flash('success', 'Cập nhật phòng thành công.');
    res.redirect(`/departments/${req.body.departmentId}`);
  } catch (error) {
    next(error);
  }
}

async function deleteRoom(req, res, next) {
  try {
    await moduleRepository.deleteRoom(req.params.id);
    req.flash('success', 'Xóa phòng thành công.');
    res.redirect(`/departments/${req.query.departmentId}`);
  } catch (error) {
    next(error);
  }
}

async function createBed(req, res, next) {
  try {
    await moduleRepository.createBed(req.body);
    req.flash('success', 'Thêm giường mới thành công.');
    res.redirect(`/departments/${req.query.departmentId}`);
  } catch (error) {
    next(error);
  }
}

async function updateBed(req, res, next) {
  try {
    await moduleRepository.updateBed(req.params.id, req.body);
    req.flash('success', 'Cập nhật giường thành công.');
    res.redirect(`/departments/${req.query.departmentId}`);
  } catch (error) {
    next(error);
  }
}

async function deleteBed(req, res, next) {
  try {
    await moduleRepository.deleteBed(req.params.id);
    req.flash('success', 'Xóa giường thành công.');
    res.redirect(`/departments/${req.query.departmentId}`);
  } catch (error) {
    next(error);
  }
}

async function bhyt(req, res, next) {
  try {
    const rows = await moduleRepository.getBHYTList();
    res.render('bhyt/index', {
      title: 'Quản lý BHYT',
      activeMenu: req.query.activeMenu || 'bhyt',
      rows
    });
  } catch (error) {
    next(error);
  }
}

async function updateDischargePayment(req, res, next) {
  try {
    await moduleRepository.updateDischargePayment(req.params.id, req.body.paymentStatus);
    req.flash('success', 'Cập nhật trạng thái thanh toán thành công.');
    res.redirect('/discharges');
  } catch (error) {
    next(error);
  }
}

async function createDepartment(req, res, next) {
  try {
    await moduleRepository.createDepartment(req.body);
    req.flash('success', 'Thêm khoa mới thành công.');
    res.redirect('/departments');
  } catch (error) {
    next(error);
  }
}

async function updateDepartment(req, res, next) {
  try {
    await moduleRepository.updateDepartment(req.params.id, req.body);
    req.flash('success', 'Cập nhật khoa thành công.');
    res.redirect('/departments');
  } catch (error) {
    next(error);
  }
}

async function deleteDepartment(req, res, next) {
  try {
    await moduleRepository.deleteDepartment(req.params.id);
    req.flash('success', 'Xóa khoa thành công.');
    res.redirect('/departments');
  } catch (error) {
    if (error.number === 51001) {
      req.flash('error', error.message);
      return res.redirect('/departments');
    }
    next(error);
  }
}

async function doctors(req, res, next) {
  try {
    const [rows, departments] = await Promise.all([
      moduleRepository.getDoctors(),
      moduleRepository.getDepartmentsOverview()
    ]);
    res.render('doctors/index', {
      title: 'Quản lý bác sĩ',
      activeMenu: req.query.activeMenu || 'doctors',
      rows,
      departments
    });
  } catch (error) {
    next(error);
  }
}

async function createDoctor(req, res, next) {
  try {
    await moduleRepository.createDoctor(req.body);
    req.flash('success', 'Thêm bác sĩ thành công.');
    res.redirect('/doctors');
  } catch (error) {
    next(error);
  }
}

async function updateDoctor(req, res, next) {
  try {
    await moduleRepository.updateDoctor(req.params.id, req.body);
    req.flash('success', 'Cập nhật bác sĩ thành công.');
    res.redirect('/doctors');
  } catch (error) {
    next(error);
  }
}

async function deleteDoctor(req, res, next) {
  try {
    await moduleRepository.deleteDoctor(req.params.id);
    req.flash('success', 'Xóa bác sĩ thành công.');
    res.redirect('/doctors');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  medicalRecords,
  completeMedicalRecord,
  medicalRecordDetail,
  nursing,
  departments: makeListAction({
    repositoryMethod: 'getDepartmentsOverview',
    view: 'departments/index',
    title: 'Quản lí khoa phòng',
    activeMenu: 'departments'
  }),
  createDepartment,
  updateDepartment,
  deleteDepartment,
  departmentDetail,
  createRoom,
  updateRoom,
  deleteRoom,
  createBed,
  updateBed,
  deleteBed,
  beds,
  transferBed,
  doctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  treatments,
  updateTreatmentStatus,
  prescriptions,
  createPrescription,
  labtests,
  createLabTest,
  updateLabTestResult,
  billing,
  createBilling,
  discharges,
  createDischarge,
  users: makeListAction({
    repositoryMethod: 'getUsers',
    view: 'users/index',
    title: 'Quản lý tài khoản',
    activeMenu: 'hr-users'
  }),
  bhyt,
  updateDischargePayment,
  settings
};
