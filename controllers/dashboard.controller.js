const patientRepository = require('../repositories/patient.repository');
const moduleRepository = require('../repositories/module.repository');
const dashboardRepository = require('../repositories/dashboard.repository');

function getDoctorDashboardUrl() {
  const target = new URL(process.env.REPORTS_FRONTEND_URL || 'http://localhost:3011/reports');
  target.pathname = '/doctor-dashboard';
  target.search = '';
  return target.toString();
}

async function getSessionDoctor(req) {
  if (!req.session.user || req.session.user.roleCode !== 'DOCTOR') return null;
  return moduleRepository.getDoctorByUser(req.session.user.fullName);
}

function normalizeForSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function formatLast7Days(rows) {
  const rowMap = new Map(rows.map((row) => [row.label, Number(row.total || 0)]));
  const output = [];

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    const label = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);

    output.push({
      label,
      total: rowMap.get(label) || 0
    });
  }

  return output;
}

function containsKeyword(value, keywords) {
  const normalized = normalizeForSearch(value);
  return keywords.some((keyword) => normalized.includes(keyword));
}

function isStatus(value, expected) {
  return normalizeForSearch(value) === expected;
}

function renderDashboardHome(req, res) {
  if (req.session.user.roleCode === 'RECEPTIONIST') {
    return res.render('dashboard/cashier', {
      title: 'Tổng quan thu ngân',
      activeMenu: 'dashboard'
    });
  }

  return res.render('dashboard/index', {
    title: 'Tổng quan',
    activeMenu: 'dashboard'
  });
}

async function index(req, res, next) {
  try {
    if (req.session.user.roleCode === 'DOCTOR') {
      return res.redirect(getDoctorDashboardUrl());
    }

    return renderDashboardHome(req, res);
  } catch (error) {
    return next(error);
  }
}

async function home(req, res, next) {
  try {
    return renderDashboardHome(req, res);
  } catch (error) {
    return next(error);
  }
}

function parseVitals(vitalString) {
  const vitals = {
    pulse: null,
    bp: null,
    temp: null,
    spo2: null,
    isAbnormal: false,
    alerts: []
  };

  if (!vitalString) return vitals;

  const parts = vitalString.split(';').map((s) => s.trim());
  parts.forEach((part) => {
    if (part.startsWith('Mạch:')) {
      const val = parseInt(part.replace('Mạch:', '').trim());
      if (!isNaN(val)) {
        vitals.pulse = val;
        if (val > 100 || val < 60) vitals.alerts.push(`Mạch ${val}`);
      }
    } else if (part.startsWith('Huyết áp:')) {
      const val = part.replace('Huyết áp:', '').trim();
      if (val !== '--') {
        vitals.bp = val;
        const [sys] = val.split('/').map((s) => parseInt(s));
        if (!isNaN(sys) && (sys > 140 || sys < 90)) vitals.alerts.push(`HA ${val}`);
      }
    } else if (part.startsWith('Nhiệt độ:')) {
      const val = parseFloat(part.replace('Nhiệt độ:', '').trim());
      if (!isNaN(val)) {
        vitals.temp = val;
        if (val > 38.0 || val < 36.0) vitals.alerts.push(`Nhiệt ${val}°C`);
      }
    } else if (part.startsWith('SpO2:')) {
      const val = parseInt(part.replace('SpO2:', '').trim());
      if (!isNaN(val)) {
        vitals.spo2 = val;
        if (val < 94) vitals.alerts.push(`SpO2 ${val}%`);
      }
    }
  });

  vitals.isAbnormal = vitals.alerts.length > 0;
  return vitals;
}

async function doctorSummary(req, res, next) {
  try {
    if (!req.session.user || req.session.user.roleCode !== 'DOCTOR') {
      return res.status(403).json({ message: 'Doctor dashboard is only available for DOCTOR role.' });
    }

    const doctor = await getSessionDoctor(req);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile could not be resolved from the current session.' });
    }

    const procedureKeywords = ['thu thuat', 'mo', 'phau thuat', 'can thiep', 'noi soi', 'dat', 'rut', 'choc', 'dan luu'];
    const [patients, labs, treatments, departmentLoad, trendRows] = await Promise.all([
      patientRepository.getInpatients({ doctorId: doctor.doctorId }),
      moduleRepository.getLabTests(doctor.doctorId),
      moduleRepository.getTreatments(doctor.doctorId),
      moduleRepository.getInpatientStats(),
      dashboardRepository.getDoctorAdmissionTrend(doctor.doctorId)
    ]);

    // 1. Clinical Alerts & Worklist
    const abnormalPatients = patients
      .map((p) => ({ ...p, vitalsParsed: parseVitals(p.vitalSigns) }))
      .filter((p) => p.vitalsParsed.isAbnormal || ['Nguy cấp', 'Cao'].includes(p.priorityLevel));

    const pendingLabs = labs.filter((row) => !isStatus(row.status, 'da co ket qua'));
    const criticalLabs = labs.filter((row) => 
      isStatus(row.status, 'da co ket qua') && 
      row.resultSummary && 
      (row.resultSummary.toLowerCase().includes('tăng') || row.resultSummary.toLowerCase().includes('giảm') || row.resultSummary.toLowerCase().includes('bất thường'))
    );

    const worklist = [
      ...pendingLabs.map(l => ({ type: 'Chờ KQ', title: `Đôn đốc XN ${l.testType}`, patient: l.patientName, priority: 'Normal' })),
      ...criticalLabs.slice(0, 3).map(l => ({ type: 'Duyệt KQ', title: `Duyệt XN ${l.testType} bất thường`, patient: l.patientName, priority: 'High' })),
      ...patients.filter(p => isStatus(p.status, 'cho xuat vien')).map(p => ({ type: 'Ký hồ sơ', title: 'Hoàn thiện hồ sơ ra viện', patient: p.fullName, priority: 'Medium' })),
      ...patients.filter(p => !p.vitalSigns || p.vitalSigns.includes('--')).map(p => ({ type: 'Khám bệnh', title: 'Chưa có dấu hiệu sinh tồn mới', patient: p.fullName, priority: 'High' }))
    ];

    // 2. Statistics & Charts
    const procedureRows = treatments.filter((row) => containsKeyword(row.treatmentContent, procedureKeywords));
    const statusRows = ['dang dieu tri', 'theo doi', 'on dinh', 'cho xuat vien']
      .map((name) => ({
        name,
        value: patients.filter((row) => isStatus(row.status, name)).length
      }))
      .filter((row) => row.value > 0)
      .map((row) => ({
        name:
          row.name === 'dang dieu tri'
            ? 'Đang điều trị'
            : row.name === 'theo doi'
              ? 'Theo dõi'
              : row.name === 'on dinh'
                ? 'Ổn định'
                : 'Chờ xuất viện',
        value: row.value
      }));

    const departmentSummary = departmentLoad.find((row) =>
      row.departmentName === (doctor.departmentName || patients[0]?.departmentName)
    );

    return res.json({
      generatedAt: new Date().toISOString(),
      user: {
        fullName: req.session.user.fullName,
        roleCode: req.session.user.roleCode,
        specialty: doctor.specialty,
        shiftName: doctor.shiftName,
        departmentName: doctor.departmentName || null
      },
      summary: {
        activePatients: patients.length,
        highRiskPatients: abnormalPatients.length,
        pendingLabs: pendingLabs.length,
        proceduresToday: procedureRows.length,
        dischargeQueue: patients.filter((row) => isStatus(row.status, 'cho xuat vien')).length,
        departmentOccupancy:
          departmentSummary && Number(departmentSummary.totalBeds || 0) > 0
            ? Math.round((Number(departmentSummary.patientCount || 0) / Number(departmentSummary.totalBeds || 0)) * 100)
            : 0
      },
      clinicalAlerts: abnormalPatients.map(p => ({
        patientId: p.patientId,
        fullName: p.fullName,
        bedCode: p.bedCode,
        alerts: p.vitalsParsed.alerts,
        priority: p.priorityLevel
      })),
      worklist: worklist.slice(0, 10),
      charts: {
        admissionTrend: formatLast7Days(trendRows),
        departmentLoad,
        patientStatuses: statusRows
      },
      lists: {
        patients: patients.map(p => ({ ...p, vitalsParsed: parseVitals(p.vitalSigns) })),
        labs: labs.slice(0, 15),
        procedures: procedureRows
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  index,
  home,
  doctorSummary
};
