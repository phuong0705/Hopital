const express = require('express');
const moduleRepository = require('../repositories/module.repository');

const router = express.Router();

const reportAccess = {
  inpatient: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
  revenue: ['ADMIN', 'RECEPTIONIST'],
  visits: ['ADMIN', 'RECEPTIONIST'],
  medicines: ['ADMIN', 'DOCTOR', 'NURSE'],
  discharges: ['ADMIN', 'DOCTOR', 'RECEPTIONIST']
};

function canViewReport(roleCode, reportKey) {
  return roleCode === 'ADMIN' || reportAccess[reportKey].includes(roleCode);
}

function requireApiAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      message: 'Vui lòng đăng nhập để xem báo cáo.'
    });
  }

  return next();
}

router.get('/summary', requireApiAuth, async (req, res, next) => {
  try {
    const roleCode = req.session.user.roleCode;
    const permissions = Object.fromEntries(
      Object.keys(reportAccess).map((reportKey) => [
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
        ? moduleRepository.getInpatientStats().then((rows) => {
          data.inpatient = rows;
        })
        : Promise.resolve(),
      permissions.revenue
        ? moduleRepository.getRevenueStats().then((rows) => {
          data.revenue = rows;
        })
        : Promise.resolve(),
      permissions.visits
        ? moduleRepository.getVisitStats().then((rows) => {
          data.visits = rows;
        })
        : Promise.resolve(),
      permissions.medicines
        ? moduleRepository.getMedicineUsageStats().then((rows) => {
          data.medicines = rows;
        })
        : Promise.resolve(),
      permissions.discharges
        ? moduleRepository.getDischarges().then((rows) => {
          data.discharges = rows;
        })
        : Promise.resolve()
    ]);

    return res.json({
      generatedAt: new Date().toISOString(),
      user: {
        fullName: req.session.user.fullName,
        roleCode
      },
      permissions,
      data
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
