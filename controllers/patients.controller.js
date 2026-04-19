const patientRepository = require('../repositories/patient.repository');
const lookupRepository = require('../repositories/lookup.repository');
const moduleRepository = require('../repositories/module.repository');

async function receptionForm(req, res, next) {
  try {
    const [departments, doctors] = await Promise.all([
      lookupRepository.getDepartments(),
      lookupRepository.getDoctors()
    ]);

    res.render('patients/reception', {
      title: 'Tiếp nhận bệnh nhân',
      activeMenu: req.query.activeMenu || 'reception',
      defaultAdmissionDate: toDateTimeLocalValue(new Date()),
      departments,
      doctors
    });
  } catch (error) {
    next(error);
  }
}

async function createAdmission(req, res, next) {
  try {
    await patientRepository.createAdmission(req.body);
    req.flash('success', 'Tiếp nhận bệnh nhân nội trú thành công.');
    res.redirect('/patients/list');
  } catch (error) {
    next(error);
  }
}

function toDateTimeLocalValue(value) {
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

async function getSessionDoctorId(req) {
  if (!req.session.user || req.session.user.roleCode !== 'DOCTOR') return null;
  const doctor = await moduleRepository.getDoctorByUser(req.session.user.fullName);
  return doctor ? doctor.doctorId : -1;
}

async function doctorOverview(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const doctors = await moduleRepository.getDoctors();
    
    res.render('patients/index', {
      title: 'Tổng quan điều trị',
      activeMenu: req.query.activeMenu || 'patients',
      doctors: doctorId ? doctors.filter((doctor) => Number(doctor.doctorId) === Number(doctorId)) : doctors,
      selectedDoctorId: doctorId,
      isDoctor: !!doctorId
    });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const filters = {
      ...req.query,
      ...(doctorId ? { doctorId } : {})
    };

    const [patients, departments, doctors, activeAdmissions, availableBeds] = await Promise.all([
      patientRepository.getInpatients(filters),
      lookupRepository.getDepartments(),
      moduleRepository.getDoctors(),
      moduleRepository.getActiveAdmissions(doctorId),
      moduleRepository.getAvailableBeds()
    ]);

    res.render('patients/list', {
      title: 'Danh sách bệnh nhân nội trú',
      activeMenu: req.query.activeMenu || 'patients',
      patients,
      departments,
      doctors: doctorId ? doctors.filter((doctor) => Number(doctor.doctorId) === Number(doctorId)) : doctors,
      activeAdmissions,
      availableBeds,
      filters
    });
  } catch (error) {
    next(error);
  }
}

async function detail(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    const patient = await patientRepository.getPatientDetail(req.params.id, doctorId);
    if (!patient) {
      return res.status(404).render('errors/404', { title: 'Không tìm thấy', activeMenu: req.query.activeMenu || 'patients' });
    }
    return res.render('patients/detail', {
      title: `Bệnh nhân ${patient.full_name}`,
      activeMenu: req.query.activeMenu || 'patients',
      patient
    });
  } catch (error) {
    return next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const doctorId = await getSessionDoctorId(req);
    await patientRepository.updateAdmissionStatus(req.params.admissionId, req.body, doctorId);
    req.flash('success', 'Cập nhật tình trạng bệnh nhân thành công.');
    return res.redirect('/patients/list');
  } catch (error) {
    return next(error);
  }
}

async function myProfile(req, res, next) {
  try {
    const data = await getCurrentPatientPortal(req, res);
    if (!data) return null;

    return res.render('patients/portal-overview', {
      title: 'Hồ sơ của tôi',
      activeMenu: 'my-profile',
      data
    });
  } catch (error) {
    return next(error);
  }
}

async function getCurrentPatientPortal(req, res) {
  if (!req.session.user.patientId) {
    res.status(403).render('errors/403', {
      title: 'Chưa liên kết hồ sơ bệnh nhân',
      activeMenu: 'my-profile'
    });
    return null;
  }

  const data = await patientRepository.getPatientPortal(req.session.user.patientId);
  if (!data.patient) {
    res.status(404).render('errors/404', {
      title: 'Không tìm thấy hồ sơ bệnh nhân',
      activeMenu: 'my-profile'
    });
    return null;
  }

  return data;
}

function patientPortalPage(view, title, activeMenu) {
  return async (req, res, next) => {
    try {
      const data = await getCurrentPatientPortal(req, res);
      if (!data) return null;

      return res.render(view, {
        title,
        activeMenu,
        data
      });
    } catch (error) {
      return next(error);
    }
  };
}

async function createSupportRequest(req, res, next) {
  try {
    const message = (req.body.message || '').trim();

    if (!message) {
      req.flash('error', 'Vui lòng nhập nội dung cần hỗ trợ.');
      return res.redirect('/patients/me/support');
    }

    await patientRepository.createSupportRequest({
      userId: req.session.user.userId,
      requestType: req.body.requestType || 'Hỗ trợ chung',
      message
    });

    req.flash('success', 'Yêu cầu hỗ trợ đã được gửi. Nhân viên bệnh viện sẽ kiểm tra và phản hồi.');
    return res.redirect('/patients/me/support');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  receptionForm,
  createAdmission,
  doctorOverview,
  list,
  detail,
  updateStatus,
  myProfile,
  treatmentsPage: patientPortalPage('patients/portal-treatments', 'Lịch điều trị', 'patient-care'),
  medicinesPage: patientPortalPage('patients/portal-medicines', 'Thuốc của tôi', 'patient-medicine'),
  labTestsPage: patientPortalPage('patients/portal-labtests', 'Xét nghiệm', 'patient-labs'),
  billingPage: patientPortalPage('patients/portal-billing', 'Viện phí', 'patient-billing'),
  dischargePage: patientPortalPage('patients/portal-discharge', 'Xuất viện', 'patient-discharge'),
  supportPage: patientPortalPage('patients/portal-support', 'Hỗ trợ', 'patient-support'),
  createSupportRequest
};
