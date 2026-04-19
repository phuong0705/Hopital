const { query, execute } = require('./base.repository');

async function getInpatients(filters = {}) {
  const where = ["a.status <> N'Đã hủy'"];
  const params = {};

  if (filters.keyword) {
    where.push('(p.patient_code LIKE @keyword OR p.full_name LIKE @keyword OR p.identity_number LIKE @keyword)');
    params.keyword = `%${filters.keyword}%`;
  }
  if (filters.departmentId) {
    where.push('a.department_id = @departmentId');
    params.departmentId = Number(filters.departmentId);
  }
  if (filters.doctorId) {
    where.push('a.doctor_id = @doctorId');
    params.doctorId = Number(filters.doctorId);
  }
  if (filters.status) {
    where.push('a.status = @status');
    params.status = filters.status;
  }
  if (filters.admissionDate) {
    where.push('CAST(a.admission_date AS date) = @admissionDate');
    params.admissionDate = filters.admissionDate;
  }

  return query(`
    SELECT a.admission_id AS admissionId, p.patient_id AS patientId, p.patient_code AS patientCode,
      p.full_name AS fullName, p.date_of_birth AS dateOfBirth, p.gender, p.phone, p.identity_number AS identityNumber,
      a.initial_diagnosis AS diagnosis,
      d.department_name AS departmentName, r.room_code AS roomCode, b.bed_code AS bedCode,
      doc.full_name AS doctorName, a.admission_date AS admissionDate, a.status, a.priority_level AS priorityLevel
    FROM Admissions a
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    LEFT JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    WHERE ${where.join(' AND ')}
    ORDER BY a.admission_date DESC
  `, params);
}

async function updateAdmissionStatus(admissionId, data, doctorId = null) {
  const statuses = ['Đang điều trị', 'Theo dõi', 'Ổn định', 'Chờ xuất viện'];
  const priorities = ['Thấp', 'Trung bình', 'Cao', 'Nguy cấp'];
  const status = statuses.includes(data.status) ? data.status : 'Đang điều trị';
  const priorityLevel = priorities.includes(data.priorityLevel) ? data.priorityLevel : 'Trung bình';

  const whereDoctor = doctorId ? 'AND doctor_id = @doctorId' : '';

  const params = {
    admissionId: Number(admissionId),
    status,
    priorityLevel
  };
  if (doctorId) params.doctorId = Number(doctorId);

  await execute(`
    UPDATE Admissions
    SET status = @status,
        priority_level = @priorityLevel
    WHERE admission_id = @admissionId
      ${whereDoctor};

    UPDATE MedicalRecords
    SET status = @status,
        updated_at = SYSDATETIME()
    WHERE admission_id = @admissionId;
  `, params);
}

async function getPatientDetail(patientId, doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';

  const rows = await query(`
    SELECT TOP 1 p.*, a.admission_id, a.admission_date, a.initial_diagnosis, a.initial_condition,
      a.status AS admission_status, a.priority_level, d.department_name, r.room_code, b.bed_code,
      doc.full_name AS doctor_name
    FROM Patients p
    LEFT JOIN Admissions a ON a.patient_id = p.patient_id
    LEFT JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    LEFT JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    WHERE p.patient_id = @patientId
      ${whereDoctor}
    ORDER BY a.admission_date DESC
  `, doctorId ? { patientId, doctorId: Number(doctorId) } : { patientId });
  return rows[0];
}

async function getPatientPortal(patientId) {
  const patientRows = await query(`
    SELECT TOP 1 p.*, a.admission_id, a.admission_date, a.initial_diagnosis, a.initial_condition,
      a.status AS admission_status, a.priority_level, d.department_name, r.room_code, b.bed_code,
      doc.full_name AS doctor_name, mr.record_id, mr.record_code, mr.vital_signs, mr.doctor_notes,
      mr.medical_history, mr.allergies
    FROM Patients p
    LEFT JOIN Admissions a ON a.patient_id = p.patient_id
    LEFT JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    LEFT JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    LEFT JOIN MedicalRecords mr ON mr.admission_id = a.admission_id
    WHERE p.patient_id = @patientId
    ORDER BY a.admission_date DESC
  `, { patientId });

  const treatments = await query(`
    SELECT TOP 5 ts.scheduled_time AS scheduledTime, ts.treatment_content AS treatmentContent,
      ts.assignee_name AS assigneeName, ts.status, ts.note
    FROM TreatmentSchedules ts
    INNER JOIN MedicalRecords mr ON mr.record_id = ts.record_id
    WHERE mr.patient_id = @patientId
    ORDER BY ts.scheduled_time DESC
  `, { patientId });

  const prescriptions = await query(`
    SELECT TOP 6 pi.medicine_name AS medicineName, pi.dosage, pi.frequency, pi.route,
      pr.start_date AS startDate, pr.end_date AS endDate, doc.full_name AS doctorName
    FROM Prescriptions pr
    INNER JOIN PrescriptionItems pi ON pi.prescription_id = pr.prescription_id
    INNER JOIN MedicalRecords mr ON mr.record_id = pr.record_id
    INNER JOIN Doctors doc ON doc.doctor_id = pr.doctor_id
    WHERE mr.patient_id = @patientId
    ORDER BY pr.start_date DESC
  `, { patientId });

  const labTests = await query(`
    SELECT TOP 6 lt.test_code AS testCode, lt.test_type AS testType, lt.ordered_date AS orderedDate,
      lt.status, lt.result_summary AS resultSummary
    FROM LabTests lt
    INNER JOIN MedicalRecords mr ON mr.record_id = lt.record_id
    WHERE mr.patient_id = @patientId
    ORDER BY lt.ordered_date DESC
  `, { patientId });

  const billingRows = await query(`
    SELECT TOP 1 b.bill_code AS billCode, b.consultation_fee AS consultationFee,
      b.billing_id AS billingId,
      b.bed_fee AS bedFee, b.medicine_fee AS medicineFee, b.lab_fee AS labFee,
      b.insurance_covered AS insuranceCovered, b.total_amount AS totalAmount,
      b.payment_status AS paymentStatus
    FROM Billing b
    INNER JOIN Admissions a ON a.admission_id = b.admission_id
    WHERE a.patient_id = @patientId
    ORDER BY b.created_at DESC
  `, { patientId });

  const billingItems = billingRows[0]
    ? await query(`
      SELECT item_name AS itemName, item_type AS itemType, quantity, unit_price AS unitPrice, amount
      FROM BillingItems
      WHERE billing_id = @billingId
      ORDER BY billing_item_id
    `, { billingId: billingRows[0].billingId })
    : [];

  const dischargeRows = await query(`
    SELECT TOP 1 d.discharge_condition AS dischargeCondition, d.discharge_date AS dischargeDate,
      d.treatment_summary AS treatmentSummary, d.total_cost AS totalCost, d.payment_status AS paymentStatus
    FROM Discharges d
    INNER JOIN Admissions a ON a.admission_id = d.admission_id
    WHERE a.patient_id = @patientId
    ORDER BY d.discharge_date DESC
  `, { patientId });

  return {
    patient: patientRows[0],
    treatments,
    prescriptions,
    labTests,
    billing: billingRows[0],
    billingItems,
    discharge: dischargeRows[0]
  };
}

async function createAdmission(data) {
  const dateOfBirth = data.dateOfBirth ? new Date(`${data.dateOfBirth}T00:00:00`) : null;
  const admissionDate = data.admissionDate ? new Date(data.admissionDate) : new Date();

  await execute(`
    DECLARE @patientId INT;

    INSERT INTO Patients (
      patient_code, full_name, date_of_birth, gender, identity_number, phone, address,
      health_insurance_no, emergency_contact_name, emergency_contact_phone
    )
    VALUES (
      @patientCode, @fullName, @dateOfBirth, @gender, @identityNumber, @phone, @address,
      @healthInsuranceNo, @emergencyContactName, @emergencyContactPhone
    );

    SET @patientId = SCOPE_IDENTITY();

    INSERT INTO Admissions (
      patient_id, department_id, doctor_id, admission_date, initial_diagnosis,
      initial_condition, status, priority_level
    )
    VALUES (
      @patientId, @departmentId, @doctorId, @admissionDate, @initialDiagnosis,
      @initialCondition, N'Đang điều trị', @priorityLevel
    );

    INSERT INTO MedicalRecords (
      record_code, patient_id, admission_id, diagnosis_on_admission, medical_history,
      allergies, vital_signs, doctor_notes, status
    )
    VALUES (
      CONCAT('HS', FORMAT(GETDATE(), 'yyMMdd'), RIGHT('0000' + CAST(@patientId AS varchar(8)), 4)),
      @patientId, SCOPE_IDENTITY(), @initialDiagnosis, N'Chưa ghi nhận', N'Chưa ghi nhận',
      N'Mạch: --; Huyết áp: --; Nhiệt độ: --; SpO2: --', N'Hồ sơ được tạo khi tiếp nhận.', N'Đang điều trị'
    );
  `, {
    patientCode: data.patientCode,
    fullName: data.fullName,
    dateOfBirth,
    gender: data.gender,
    identityNumber: data.identityNumber,
    phone: data.phone,
    address: data.address,
    healthInsuranceNo: data.healthInsuranceNo,
    emergencyContactName: data.emergencyContactName,
    emergencyContactPhone: data.emergencyContactPhone,
    departmentId: Number(data.departmentId),
    doctorId: Number(data.doctorId),
    admissionDate,
    initialDiagnosis: data.initialDiagnosis,
    initialCondition: data.initialCondition,
    priorityLevel: data.priorityLevel || 'Trung bình'
  });
}

async function createSupportRequest(data) {
  await execute(`
    INSERT INTO Notifications (user_id, title, message, type)
    VALUES (@userId, @title, @message, @type)
  `, {
    userId: data.userId,
    title: `Yêu cầu bệnh nhân: ${data.requestType}`,
    message: data.message,
    type: 'patient-support'
  });
}

module.exports = {
  getInpatients,
  getPatientDetail,
  getPatientPortal,
  updateAdmissionStatus,
  createSupportRequest,
  createAdmission
};
