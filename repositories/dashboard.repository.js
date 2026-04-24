const { query } = require('./base.repository');

async function getOverviewStats() {
  const rows = await query(`
    SELECT
      (SELECT COUNT(*) FROM Admissions WHERE status = N'Đang điều trị') AS inpatientCount,
      (SELECT COUNT(*) FROM Admissions WHERE CAST(admission_date AS date) = CAST(GETDATE() AS date)) AS todayAdmissions,
      (SELECT COUNT(*) FROM Discharges WHERE CAST(discharge_date AS date) = CAST(GETDATE() AS date)) AS todayDischarges,
      (SELECT COUNT(*) FROM Beds WHERE status = N'Đang sử dụng') AS usedBeds,
      (SELECT COUNT(*) FROM Beds) AS totalBeds,
      (SELECT COUNT(*) FROM Admissions WHERE priority_level IN (N'Cao', N'Nguy cấp') AND status = N'Đang điều trị') AS highRiskCount,
      (SELECT ISNULL(SUM(total_amount), 0) FROM Billing WHERE CAST(created_at AS date) = CAST(GETDATE() AS date)) AS todayBilling
  `);

  return rows[0];
}

async function getAdmissionTrend() {
  return query(`
    SELECT FORMAT(CAST(admission_date AS date), 'dd/MM') AS label, COUNT(*) AS total
    FROM Admissions
    WHERE admission_date >= DATEADD(day, -6, CAST(GETDATE() AS date))
    GROUP BY CAST(admission_date AS date)
    ORDER BY CAST(admission_date AS date)
  `);
}

async function getPatientsByDepartment() {
  return query(`
    SELECT d.department_name AS label, COUNT(a.admission_id) AS total
    FROM Departments d
    LEFT JOIN Admissions a ON a.department_id = d.department_id AND a.status = N'Đang điều trị'
    GROUP BY d.department_name
    ORDER BY d.department_name
  `);
}

async function getHighRiskPatients() {
  return query(`
    SELECT TOP 6 p.patient_code AS patientCode, p.full_name AS fullName, d.department_name AS departmentName,
      a.initial_diagnosis AS diagnosis, a.priority_level AS priorityLevel, b.bed_code AS bedCode
    FROM Admissions a
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    WHERE a.status = N'Đang điều trị' AND a.priority_level IN (N'Cao', N'Nguy cấp')
    ORDER BY CASE a.priority_level WHEN N'Nguy cấp' THEN 1 WHEN N'Cao' THEN 2 ELSE 3 END, a.admission_date DESC
  `);
}

async function getCrowdedRooms() {
  return query(`
    SELECT TOP 6 r.room_code AS roomCode, d.department_name AS departmentName,
      COUNT(CASE WHEN b.status = N'Đang sử dụng' THEN 1 END) AS usedBeds,
      COUNT(b.bed_id) AS totalBeds
    FROM Rooms r
    INNER JOIN Departments d ON d.department_id = r.department_id
    INNER JOIN Beds b ON b.room_id = r.room_id
    GROUP BY r.room_code, d.department_name
    HAVING COUNT(CASE WHEN b.status = N'Đang sử dụng' THEN 1 END) >= COUNT(b.bed_id) * 0.75
    ORDER BY usedBeds DESC
  `);
}

async function getDelayedLabTests() {
  return query(`
    SELECT TOP 6 lt.test_code AS testCode, p.full_name AS patientName, lt.test_type AS testType,
      lt.ordered_date AS orderedDate, lt.status
    FROM LabTests lt
    INNER JOIN MedicalRecords mr ON mr.record_id = lt.record_id
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    WHERE lt.status IN (N'Chờ kết quả', N'Đang thực hiện')
    ORDER BY lt.ordered_date
  `);
}

async function getCashierStats() {
  const rows = await query(`
    SELECT
      (SELECT COUNT(*) FROM Admissions WHERE CAST(admission_date AS date) = CAST(GETDATE() AS date)) AS todayAdmissions,
      (SELECT COUNT(*) FROM Billing WHERE payment_status IN (N'Chưa thanh toán', N'Một phần')) AS pendingPaymentCount,
      (SELECT ISNULL(SUM(total_amount), 0) FROM Billing WHERE payment_status IN (N'Chưa thanh toán', N'Một phần')) AS pendingPaymentAmount,
      (SELECT COUNT(*) FROM Discharges WHERE payment_status IN (N'Chưa thanh toán', N'Một phần')) AS pendingDischargePayments,
      (SELECT COUNT(*) FROM Discharges WHERE CAST(discharge_date AS date) = CAST(GETDATE() AS date)) AS todayDischarges
  `);

  return rows[0];
}

async function getTodayAdmissionList() {
  return query(`
    SELECT TOP 6 p.patient_code AS patientCode, p.full_name AS fullName, p.phone,
      a.admission_date AS admissionDate, d.department_name AS departmentName,
      doc.full_name AS doctorName, a.status
    FROM Admissions a
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    INNER JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    WHERE CAST(a.admission_date AS date) = CAST(GETDATE() AS date)
    ORDER BY a.admission_date DESC
  `);
}

async function getPendingPayments() {
  return query(`
    SELECT TOP 8 b.bill_code AS billCode, p.patient_code AS patientCode, p.full_name AS patientName,
      b.total_amount AS totalAmount, b.payment_status AS paymentStatus, b.created_at AS createdAt
    FROM Billing b
    INNER JOIN Admissions a ON a.admission_id = b.admission_id
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    WHERE b.payment_status IN (N'Chưa thanh toán', N'Một phần')
    ORDER BY b.created_at DESC
  `);
}

async function getDischargePaymentQueue() {
  return query(`
    SELECT TOP 6 p.patient_code AS patientCode, p.full_name AS patientName,
      d.discharge_date AS dischargeDate, d.total_cost AS totalCost, d.payment_status AS paymentStatus
    FROM Discharges d
    INNER JOIN Admissions a ON a.admission_id = d.admission_id
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    WHERE d.payment_status IN (N'Chưa thanh toán', N'Một phần')
    ORDER BY d.discharge_date DESC
  `);
}

async function getDoctorAdmissionTrend(doctorId) {
  return query(`
    SELECT FORMAT(CAST(admission_date AS date), 'dd/MM') AS label, COUNT(*) AS total
    FROM Admissions
    WHERE doctor_id = @doctorId
      AND admission_date >= DATEADD(day, -6, CAST(GETDATE() AS date))
    GROUP BY CAST(admission_date AS date)
    ORDER BY CAST(admission_date AS date)
  `, { doctorId: Number(doctorId) });
}

module.exports = {
  getHighRiskPatients,
  getDelayedLabTests,
  getTodayAdmissionList,
  getPendingPayments,
  getDischargePaymentQueue,
  getDoctorAdmissionTrend
};
