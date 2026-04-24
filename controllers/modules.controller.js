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
  const doctor = await moduleRepository.getDoctorByUser(req.session.user.fullName);
  return doctor ? doctor.doctorId : -1;
}

async function medicalRecords(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const rows = await moduleRepository.getMedicalRecords(doctorId);
    res.render('medical-records/index', {
      title: 'Hồ sơ bệnh án',
      activeMenu: req.query.activeMenu || 'medical-records',
      rows
    });
  } catch (error) {
    next(error);
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
      activeMenu: req.query.activeMenu || 'medical-records',
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
      selectedDoctor = await moduleRepository.getDoctorByUser(req.session.user.fullName);
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
    const [rows, activeRecords, doctors] = await Promise.all([
      moduleRepository.getPrescriptions(doctorId),
      moduleRepository.getActiveMedicalRecords(doctorId),
      doctorId ? Promise.resolve([]) : moduleRepository.getDoctors()
    ]);
    const selectedDoctor = doctorId ? await moduleRepository.getDoctorByUser(req.session.user.fullName) : null;

    res.render('prescriptions/index', {
      title: 'Thuốc và đơn thuốc',
      activeMenu: req.query.activeMenu || 'prescriptions',
      rows,
      activeRecords,
      doctors,
      selectedDoctor
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
    next(error);
  }
}

async function labtests(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const rows = await moduleRepository.getLabTests(doctorId);
    res.render('labtests/index', {
      title: 'Xét nghiệm / cận lâm sàng',
      activeMenu: req.query.activeMenu || 'labtests',
      rows
    });
  } catch (error) {
    next(error);
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
