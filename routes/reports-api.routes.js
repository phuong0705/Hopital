const express = require('express');
const moduleRepository = require('../repositories/module.repository');
const nurseAssignmentRepository = require('../repositories/nurse-assignment.repository');

const router = express.Router();

const reportAccess = {
  ADMIN: ['inpatient', 'revenue', 'visits', 'medicines', 'discharges'],
  DOCTOR: ['inpatient', 'visits', 'medicines', 'discharges'],
  NURSE: ['inpatient'],
  RECEPTIONIST: ['revenue', 'visits', 'discharges'],
  PHARMACY: ['medicines'],
  LAB: []
};

function canViewReport(roleCode, reportKey) {
  return (reportAccess[roleCode] || []).includes(reportKey);
}

function requireApiAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      message: 'Vui lòng đăng nhập để xem báo cáo.'
    });
  }

  if (!['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB', 'PHARMACY'].includes(req.session.user.roleCode)) {
    return res.status(403).json({
      message: 'Tài khoản không có quyền xem báo cáo.'
    });
  }

  return next();
}

async function getReportScope(user) {
  if (user.roleCode === 'DOCTOR') {
    const doctor = await moduleRepository.getDoctorByUser(user);
    return {
      doctorId: doctor ? Number(doctor.doctorId) : -1,
      departmentId: doctor?.departmentId || null,
      label: doctor?.fullName || user.fullName
    };
  }

  if (user.roleCode === 'NURSE') {
    const supervisor = await nurseAssignmentRepository.getNurseSupervisor(user.userId);
    return {
      doctorId: supervisor ? Number(supervisor.doctorId) : -1,
      departmentId: supervisor?.departmentId || user.departmentId || null,
      label: supervisor?.departmentName || user.departmentName || user.fullName
    };
  }

  return {
    doctorId: null,
    departmentId: null,
    label: null
  };
}

router.get('/summary', requireApiAuth, async (req, res, next) => {
  try {
    const { user } = req.session;
    const roleCode = user.roleCode;
    const scope = await getReportScope(user);
    const permissions = Object.fromEntries(
      ['inpatient', 'revenue', 'visits', 'medicines', 'discharges'].map((reportKey) => [
        reportKey,
        canViewReport(roleCode, reportKey)
      ])
    );

    const data = {
      inpatient: [],
      revenue: [],
      visits: [],
      medicines: [],
      discharges: []
    };

    await Promise.all([
      permissions.inpatient
        ? moduleRepository.getInpatientStats(scope).then((rows) => {
          data.inpatient = rows;
        })
        : Promise.resolve(),
      permissions.revenue
        ? moduleRepository.getRevenueStats(scope).then((rows) => {
          data.revenue = rows;
        })
        : Promise.resolve(),
      permissions.visits
        ? moduleRepository.getVisitStats(scope).then((rows) => {
          data.visits = rows;
        })
        : Promise.resolve(),
      permissions.medicines
        ? moduleRepository.getMedicineUsageStats(scope).then((rows) => {
          data.medicines = rows;
        })
        : Promise.resolve(),
      permissions.discharges
        ? moduleRepository.getDischarges(scope.doctorId || null).then((rows) => {
          data.discharges = rows;
        })
        : Promise.resolve()
    ]);

    return res.json({
      generatedAt: new Date().toISOString(),
      user: {
        fullName: user.fullName,
        roleCode,
        reportScope: scope.label
      },
      permissions,
      data
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
