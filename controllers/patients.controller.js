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
      activeMenu: 'patient-profile',
      data
    });
  } catch (error) {
    return next(error);
  }
}

async function getCurrentPatientPortal(req, res, filters = {}) {
  if (!req.session.user.patientId) {
    res.status(403).render('errors/403', {
      title: 'Chưa liên kết hồ sơ bệnh nhân',
      activeMenu: 'patient-profile'
    });
    return null;
  }

  const data = await patientRepository.getPatientPortal(req.session.user.patientId, filters);
  if (!data.patient) {
    res.status(404).render('errors/404', {
      title: 'Không tìm thấy hồ sơ bệnh nhân',
      activeMenu: 'patient-profile'
    });
    return null;
  }

  return data;
}

function patientPortalPage(view, title, activeMenu) {
  return async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const data = await getCurrentPatientPortal(req, res, { startDate, endDate });
      if (!data) return null;

      return res.render(view, {
        title,
        activeMenu,
        data,
        filters: { startDate, endDate }
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

async function submitBooking(req, res, next) {
  try {
    const { patientId } = req.session.user;
    if (!patientId) {
      req.flash('error', 'Hồ sơ bệnh nhân chưa được liên kết.');
      return res.redirect('/patients/me/booking');
    }

    await patientRepository.createBooking({
      patientId,
      requestedDate: req.body.requestedDate,
      requestedTime: req.body.requestedTime,
      departmentId: req.body.departmentId,
      doctorId: req.body.doctorId,
      reason: req.body.reason
    });

    req.flash('success', 'Yêu cầu đặt lịch tái khám đã được gửi thành công.');
    return res.redirect('/patients/me/booking');
  } catch (error) {
    return next(error);
  }
}

async function processPayment(req, res, next) {
  try {
    const { id } = req.params;
    await patientRepository.payBilling(id);
    req.flash('success', 'Thanh toán thành công. Trạng thái đã được cập nhật.');
    return res.redirect('/patients/me/billing');
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
  treatmentsPage: patientPortalPage('patients/portal-treatments', 'Lịch sử khám bệnh', 'patient-history'),
  medicinesPage: patientPortalPage('patients/portal-medicines', 'Đơn thuốc của tôi', 'patient-medicine'),
  labTestsPage: patientPortalPage('patients/portal-labtests', 'Kết quả xét nghiệm', 'patient-labs'),
  billingPage: patientPortalPage('patients/portal-billing', 'Hóa đơn & Thanh toán', 'patient-billing'),
  dischargePage: patientPortalPage('patients/portal-discharge', 'Xuất viện', 'patient-discharge'),
  supportPage: patientPortalPage('patients/portal-support', 'Hỗ trợ', 'patient-support'),
  bhytPage: patientPortalPage('patients/portal-bhyt', 'Thẻ BHYT của tôi', 'patient-bhyt'),
  bookingPage: async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const data = await getCurrentPatientPortal(req, res, { startDate, endDate });
      if (!data) return null;

      // Ensure statuses are readable
      await patientRepository.fixGarbledStatuses();

      const [departments, doctors, history] = await Promise.all([
        lookupRepository.getDepartments(),
        lookupRepository.getDoctors(),
        patientRepository.getBookingHistory(req.session.user.patientId)
      ]);

      return res.render('patients/portal-booking', {
        title: 'Đặt lịch tái khám',
        activeMenu: 'patient-booking',
        data,
        departments,
        doctors,
        history,
        filters: { startDate, endDate }
      });
    } catch (error) {
      return next(error);
    }
  },
  notificationsPage: async (req, res, next) => {
    try {
      const data = await getCurrentPatientPortal(req, res);
      if (!data) return null;

      const notifications = await patientRepository.getNotifications(req.session.user.userId);
      
      // Mark as read when viewing the page
      await patientRepository.markNotificationsAsRead(req.session.user.userId);

      return res.render('patients/portal-notifications', {
        title: 'Thông báo',
        activeMenu: 'patient-notifications',
        data,
        notifications
      });
    } catch (error) {
      return next(error);
    }
  },
  createSupportRequest,
  submitBooking,
  processPayment
};
