const { query, execute } = require('./base.repository');

async function getMedicalRecords(doctorId = null) {
  const whereDoctor = doctorId ? 'WHERE a.doctor_id = @doctorId' : '';

  return query(`
    SELECT mr.record_id AS recordId, mr.record_code AS recordCode, p.full_name AS patientName,
      p.patient_code AS patientCode, mr.diagnosis_on_admission AS diagnosis,
      mr.vital_signs AS vitalSigns, mr.status, mr.created_at AS createdAt
    FROM MedicalRecords mr
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    ${whereDoctor}
    ORDER BY mr.created_at DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function getMedicalRecordDetail(recordId, doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';

  const rows = await query(`
    SELECT TOP 1 mr.*, p.patient_code, p.full_name, p.date_of_birth, p.gender, p.phone,
      p.address, a.admission_date, d.department_name, doc.full_name AS doctor_name
    FROM MedicalRecords mr
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    LEFT JOIN Admissions a ON a.admission_id = mr.admission_id
    LEFT JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    WHERE mr.record_id = @recordId
      ${whereDoctor}
  `, doctorId ? { recordId, doctorId: Number(doctorId) } : { recordId });

  const medicines = await query(`
    SELECT pr.prescription_code AS prescriptionCode, pi.medicine_name AS medicineName, pi.dosage,
      pi.frequency, pi.route, pr.start_date AS startDate, pr.end_date AS endDate
    FROM Prescriptions pr
    INNER JOIN PrescriptionItems pi ON pi.prescription_id = pr.prescription_id
    WHERE pr.record_id = @recordId
    ORDER BY pr.start_date DESC
  `, { recordId });

  const labs = await query(`
    SELECT test_type AS testType, ordered_date AS orderedDate, status, result_summary AS resultSummary
    FROM LabTests
    WHERE record_id = @recordId
    ORDER BY ordered_date DESC
  `, { recordId });

  const treatments = await query(`
    SELECT scheduled_time AS scheduledTime, treatment_content AS treatmentContent,
      assignee_name AS assigneeName, status, note
    FROM TreatmentSchedules
    WHERE record_id = @recordId
    ORDER BY scheduled_time DESC
  `, { recordId });

  return {
    record: rows[0],
    medicines,
    labs,
    treatments
  };
}

async function getDepartmentsOverview() {
  return query(`
    SELECT d.department_id AS departmentId, d.department_code AS departmentCode, d.department_name AS departmentName,
      d.head_doctor AS headDoctor, COUNT(DISTINCT r.room_id) AS roomCount, COUNT(b.bed_id) AS totalBeds,
      COUNT(CASE WHEN b.status = N'Đang sử dụng' THEN 1 END) AS usedBeds,
      COUNT(CASE WHEN b.status = N'Trống' THEN 1 END) AS availableBeds
    FROM Departments d
    LEFT JOIN Rooms r ON r.department_id = d.department_id
    LEFT JOIN Beds b ON b.room_id = r.room_id
    GROUP BY d.department_id, d.department_code, d.department_name, d.head_doctor
    ORDER BY d.department_name
  `);
}

async function getDepartmentDetail(departmentId) {
  const rows = await query(`
    SELECT d.department_id AS departmentId, d.department_code AS departmentCode, d.department_name AS departmentName,
      d.head_doctor AS headDoctor, d.phone, d.location,
      (SELECT COUNT(*) FROM Rooms WHERE department_id = d.department_id) AS roomCount,
      (SELECT COUNT(*) FROM Beds b INNER JOIN Rooms r ON r.room_id = b.room_id WHERE r.department_id = d.department_id) AS totalBeds,
      (SELECT COUNT(*) FROM Beds b INNER JOIN Rooms r ON r.room_id = b.room_id WHERE r.department_id = d.department_id AND b.status = N'Đang sử dụng') AS usedBeds,
      (SELECT COUNT(*) FROM Beds b INNER JOIN Rooms r ON r.room_id = b.room_id WHERE r.department_id = d.department_id AND b.status = N'Trống') AS availableBeds
    FROM Departments d
    WHERE d.department_id = @departmentId
  `, { departmentId: Number(departmentId) });
  return rows[0];
}

async function getDepartmentRooms(departmentId) {
  return query(`
    SELECT r.room_id AS roomId, r.room_code AS roomCode, r.room_name AS roomName, r.floor_no AS floorNo, r.room_type AS roomType, r.status,
      (SELECT COUNT(*) FROM Beds WHERE room_id = r.room_id) AS totalBeds,
      (SELECT COUNT(*) FROM Beds WHERE room_id = r.room_id AND status = N'Đang sử dụng') AS usedBeds
    FROM Rooms r
    WHERE r.department_id = @departmentId
    ORDER BY r.room_code
  `, { departmentId: Number(departmentId) });
}

async function getDepartmentBeds(departmentId) {
  return query(`
    SELECT b.bed_id AS bedId, b.bed_code AS bedCode, b.status, b.note, r.room_code AS roomCode, r.room_type AS roomType, p.full_name AS patientName
    FROM Beds b
    INNER JOIN Rooms r ON r.room_id = b.room_id
    LEFT JOIN Admissions a ON a.bed_id = b.bed_id AND a.status = N'Đang điều trị'
    LEFT JOIN Patients p ON p.patient_id = a.patient_id
    WHERE r.department_id = @departmentId
    ORDER BY r.room_code, b.bed_code
  `, { departmentId: Number(departmentId) });
}

async function getDepartmentPatients(departmentId) {
  return query(`
    SELECT p.patient_id AS patientId, p.patient_code AS patientCode, p.full_name AS fullName, a.initial_diagnosis AS diagnosis, r.room_code AS roomCode, b.bed_code AS bedCode, a.admission_date AS admissionDate
    FROM Admissions a
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    INNER JOIN Rooms r ON r.room_id = a.room_id
    INNER JOIN Beds b ON b.bed_id = a.bed_id
    WHERE a.department_id = @departmentId AND a.status = N'Đang điều trị'
    ORDER BY a.admission_date DESC
  `, { departmentId: Number(departmentId) });
}

async function getDepartmentStaff(departmentId) {
  const doctors = await query(`
    SELECT doctor_code AS code, full_name AS name, specialty, shift_name AS shift, N'Bác sĩ' AS role
    FROM Doctors
    WHERE department_id = @departmentId AND status = N'Đang làm việc'
  `, { departmentId: Number(departmentId) });
  
  const nurses = await query(`
    SELECT u.username AS code, u.full_name AS name, '' AS specialty, '' AS shift, N'Điều dưỡng' AS role
    FROM Users u
    INNER JOIN Roles r ON r.role_id = u.role_id
    WHERE u.department_id = @departmentId AND r.role_code = 'NURSE' AND u.status = N'Hoạt động'
  `, { departmentId: Number(departmentId) });
  
  return [...doctors, ...nurses];
}

async function createRoom(data) {
  await execute(`
    INSERT INTO Rooms (department_id, room_code, room_name, floor_no, room_type)
    VALUES (@departmentId, @roomCode, @roomName, @floorNo, @roomType)
  `, {
    departmentId: Number(data.departmentId),
    roomCode: data.roomCode,
    roomName: data.roomName || '',
    floorNo: Number(data.floorNo || 1),
    roomType: data.roomType || 'Thường'
  });
}

async function updateRoom(roomId, data) {
  await execute(`
    UPDATE Rooms
    SET room_code = @roomCode, room_name = @roomName, floor_no = @floorNo, room_type = @roomType
    WHERE room_id = @roomId
  `, {
    roomId: Number(roomId),
    roomCode: data.roomCode,
    roomName: data.roomName || '',
    floorNo: Number(data.floorNo),
    roomType: data.roomType
  });
}

async function deleteRoom(roomId) {
  await execute(`DELETE FROM Rooms WHERE room_id = @roomId`, { roomId: Number(roomId) });
}

async function createBed(data) {
  await execute(`
    INSERT INTO Beds (room_id, bed_code, status, note)
    VALUES (@roomId, @bedCode, @status, @note)
  `, {
    roomId: Number(data.roomId),
    bedCode: data.bedCode,
    status: data.status || 'Trống',
    note: data.note || ''
  });
}

async function updateBed(bedId, data) {
  await execute(`
    UPDATE Beds
    SET bed_code = @bedCode, status = @status, note = @note
    WHERE bed_id = @bedId
  `, {
    bedId: Number(bedId),
    bedCode: data.bedCode,
    status: data.status,
    note: data.note || ''
  });
}

async function deleteBed(bedId) {
  await execute(`DELETE FROM Beds WHERE bed_id = @bedId`, { bedId: Number(bedId) });
}

async function getBeds() {
  return query(`
    SELECT b.bed_id AS bedId, b.bed_code AS bedCode, r.room_code AS roomCode, d.department_name AS departmentName,
      b.status, p.full_name AS patientName, a.admission_date AS startDate
    FROM Beds b
    INNER JOIN Rooms r ON r.room_id = b.room_id
    INNER JOIN Departments d ON d.department_id = r.department_id
    LEFT JOIN Admissions a ON a.bed_id = b.bed_id AND a.status = N'Đang điều trị'
    LEFT JOIN Patients p ON p.patient_id = a.patient_id
    ORDER BY d.department_name, r.room_code, b.bed_code
  `);
}

async function getAvailableBeds() {
  return query(`
    SELECT b.bed_id AS bedId, b.bed_code AS bedCode, r.room_code AS roomCode, d.department_name AS departmentName
    FROM Beds b
    INNER JOIN Rooms r ON r.room_id = b.room_id
    INNER JOIN Departments d ON d.department_id = r.department_id
    WHERE b.status = N'Trống'
    ORDER BY d.department_name, r.room_code, b.bed_code
  `);
}

async function getActiveAdmissions(doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';

  return query(`
    SELECT a.admission_id AS admissionId, p.patient_code AS patientCode, p.full_name AS patientName,
      d.department_name AS departmentName, r.room_code AS roomCode, b.bed_code AS bedCode
    FROM Admissions a
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    WHERE a.status IN (N'Đang điều trị', N'Theo dõi', N'Ổn định', N'Chờ xuất viện')
      ${whereDoctor}
    ORDER BY a.admission_date DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function transferBed(data) {
  await execute(`
    DECLARE @oldBedId INT, @newRoomId INT, @newDepartmentId INT;

    SELECT @oldBedId = bed_id
    FROM Admissions
    WHERE admission_id = @admissionId;

    SELECT @newRoomId = r.room_id, @newDepartmentId = r.department_id
    FROM Beds b
    INNER JOIN Rooms r ON r.room_id = b.room_id
    WHERE b.bed_id = @bedId AND b.status = N'Trống';

    IF @newRoomId IS NULL
    BEGIN
      THROW 51000, N'Giường được chọn không còn trống.', 1;
    END;

    UPDATE Admissions
    SET bed_id = @bedId, room_id = @newRoomId, department_id = @newDepartmentId
    WHERE admission_id = @admissionId;

    UPDATE Beds SET status = N'Trống' WHERE bed_id = @oldBedId;
    UPDATE Beds SET status = N'Đang sử dụng' WHERE bed_id = @bedId;
  `, {
    admissionId: Number(data.admissionId),
    bedId: Number(data.bedId)
  });
}

async function getDoctors() {
  return query(`
    SELECT doc.doctor_id AS doctorId, doc.doctor_code AS doctorCode, doc.full_name AS fullName,
      doc.specialty, doc.phone, doc.email, doc.shift_name AS shiftName,
      COUNT(CASE WHEN a.status = N'Đang điều trị' THEN 1 END) AS patientCount
    FROM Doctors doc
    LEFT JOIN Admissions a ON a.doctor_id = doc.doctor_id
    GROUP BY doc.doctor_id, doc.doctor_code, doc.full_name, doc.specialty, doc.phone, doc.email, doc.shift_name
    ORDER BY doc.full_name
  `);
}

async function getTreatmentDoctorsOverview() {
  return query(`
    DECLARE @workDate DATE = (
      SELECT COALESCE(MAX(CAST(scheduled_time AS date)), CAST(GETDATE() AS date))
      FROM TreatmentSchedules
    );

    SELECT doc.doctor_id AS doctorId, doc.doctor_code AS doctorCode, doc.full_name AS fullName,
      doc.specialty, doc.shift_name AS shiftName, d.department_name AS departmentName,
      COUNT(DISTINCT a.admission_id) AS patientCount,
      COUNT(ts.schedule_id) AS scheduleCount,
      COUNT(CASE WHEN ts.status = N'Hoàn thành' THEN 1 END) AS completedCount,
      MIN(ts.scheduled_time) AS firstScheduleTime
    FROM Doctors doc
    INNER JOIN Departments d ON d.department_id = doc.department_id
    LEFT JOIN Admissions a ON a.doctor_id = doc.doctor_id
      AND a.status IN (N'Đang điều trị', N'Theo dõi', N'Ổn định', N'Chờ xuất viện')
    LEFT JOIN MedicalRecords mr ON mr.admission_id = a.admission_id
    LEFT JOIN TreatmentSchedules ts ON ts.record_id = mr.record_id
      AND CAST(ts.scheduled_time AS date) = @workDate
    WHERE doc.status = N'Đang làm việc'
    GROUP BY doc.doctor_id, doc.doctor_code, doc.full_name, doc.specialty, doc.shift_name, d.department_name
    ORDER BY doc.full_name
  `);
}

async function getDoctorByUser(fullName) {
  const rows = await query(`
    SELECT TOP 1 doctor_id AS doctorId, doctor_code AS doctorCode, full_name AS fullName,
      specialty, shift_name AS shiftName
    FROM Doctors
    WHERE full_name = @fullName
    ORDER BY doctor_id
  `, { fullName });

  return rows[0];
}

async function getTreatments(doctorId) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';

  return query(`
    DECLARE @workDate DATE = (
      SELECT COALESCE(MAX(CAST(scheduled_time AS date)), CAST(GETDATE() AS date))
      FROM TreatmentSchedules
      ${doctorId ? `
      WHERE record_id IN (
        SELECT mr.record_id
        FROM MedicalRecords mr
        INNER JOIN Admissions a ON a.admission_id = mr.admission_id
        WHERE a.doctor_id = @doctorId
      )` : ''}
    );

    SELECT ts.schedule_id AS scheduleId, ts.scheduled_time AS scheduledTime,
      p.patient_code AS patientCode, p.full_name AS patientName, p.gender,
      a.priority_level AS priorityLevel, a.initial_diagnosis AS diagnosis,
      d.department_name AS departmentName, r.room_code AS roomCode, b.bed_code AS bedCode,
      doc.doctor_id AS doctorId, doc.full_name AS doctorName,
      ts.treatment_content AS treatmentContent, ts.assignee_name AS assigneeName, ts.status, ts.note
    FROM TreatmentSchedules ts
    INNER JOIN MedicalRecords mr ON mr.record_id = ts.record_id
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    INNER JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    WHERE CAST(ts.scheduled_time AS date) = @workDate
      ${whereDoctor}
    ORDER BY ts.scheduled_time, p.full_name
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function updateTreatmentStatus(scheduleId, data) {
  const allowedStatuses = ['Chưa thực hiện', 'Đang thực hiện', 'Hoàn thành'];
  const status = allowedStatuses.includes(data.status) ? data.status : 'Chưa thực hiện';

  await execute(`
    UPDATE TreatmentSchedules
    SET status = @status,
        note = NULLIF(@note, '')
    WHERE schedule_id = @scheduleId
  `, {
    scheduleId: Number(scheduleId),
    status,
    note: data.note || ''
  });
}

async function getNursingWorklist() {
  return query(`
    SELECT TOP 20 a.admission_id AS admissionId, p.patient_code AS patientCode, p.full_name AS patientName,
      d.department_name AS departmentName, r.room_code AS roomCode, b.bed_code AS bedCode,
      a.priority_level AS priorityLevel, mr.vital_signs AS vitalSigns,
      ts.scheduled_time AS scheduledTime, ts.treatment_content AS treatmentContent,
      ts.status AS treatmentStatus, ts.assignee_name AS assigneeName
    FROM Admissions a
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    LEFT JOIN MedicalRecords mr ON mr.admission_id = a.admission_id
    OUTER APPLY (
      SELECT TOP 1 scheduled_time, treatment_content, status, assignee_name
      FROM TreatmentSchedules ts
      WHERE ts.record_id = mr.record_id
      ORDER BY
        CASE WHEN ts.status = N'Chưa thực hiện' THEN 0 ELSE 1 END,
        ts.scheduled_time
    ) ts
    WHERE a.status IN (N'Đang điều trị', N'Theo dõi', N'Ổn định')
    ORDER BY CASE a.priority_level WHEN N'Nguy cấp' THEN 0 WHEN N'Cao' THEN 1 ELSE 2 END, a.admission_date DESC
  `);
}

async function getPrescriptions(doctorId = null) {
  const whereDoctor = doctorId ? 'WHERE pr.doctor_id = @doctorId' : '';

  return query(`
    SELECT pr.prescription_code AS prescriptionCode, p.full_name AS patientName, pi.medicine_name AS medicineName,
      pi.dosage, pi.frequency, pi.route, pr.start_date AS startDate, pr.end_date AS endDate,
      doc.full_name AS doctorName
    FROM Prescriptions pr
    INNER JOIN MedicalRecords mr ON mr.record_id = pr.record_id
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    INNER JOIN Doctors doc ON doc.doctor_id = pr.doctor_id
    INNER JOIN PrescriptionItems pi ON pi.prescription_id = pr.prescription_id
    ${whereDoctor}
    ORDER BY pr.start_date DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function getActiveMedicalRecords(doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';

  return query(`
    SELECT mr.record_id AS recordId, mr.record_code AS recordCode,
      p.patient_code AS patientCode, p.full_name AS patientName,
      d.department_name AS departmentName, a.doctor_id AS doctorId,
      doc.full_name AS doctorName
    FROM MedicalRecords mr
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    WHERE a.status IN (N'Đang điều trị', N'Theo dõi', N'Ổn định', N'Chờ xuất viện')
      ${whereDoctor}
    ORDER BY a.admission_date DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function createPrescription(data, enforcedDoctorId = null) {
  const startDate = data.startDate ? new Date(data.startDate) : new Date();
  const endDate = data.endDate ? new Date(data.endDate) : startDate;
  const quantity = Math.max(Number(data.quantity || 1), 1);
  const doctorId = enforcedDoctorId ? Number(enforcedDoctorId) : Number(data.doctorId);

  await execute(`
    DECLARE @prescriptionId INT;

    IF NOT EXISTS (
      SELECT 1
      FROM MedicalRecords mr
      INNER JOIN Admissions a ON a.admission_id = mr.admission_id
      WHERE mr.record_id = @recordId AND a.doctor_id = @doctorId
    )
    BEGIN
      THROW 51001, N'Bác sĩ không phụ trách hồ sơ bệnh án này.', 1;
    END;

    INSERT INTO Prescriptions (
      prescription_code, record_id, doctor_id, start_date, end_date, note
    )
    VALUES (
      CONCAT('DT', FORMAT(GETDATE(), 'yyMMddHHmmss')),
      @recordId, @doctorId, @startDate, @endDate, NULLIF(@note, '')
    );

    SET @prescriptionId = SCOPE_IDENTITY();

    INSERT INTO PrescriptionItems (
      prescription_id, medicine_name, dosage, frequency, route, quantity, unit
    )
    VALUES (
      @prescriptionId, @medicineName, @dosage, @frequency, @route, @quantity, @unit
    );
  `, {
    recordId: Number(data.recordId),
    doctorId,
    startDate,
    endDate,
    note: data.note || '',
    medicineName: data.medicineName,
    dosage: data.dosage,
    frequency: data.frequency,
    route: data.route,
    quantity,
    unit: data.unit || 'viên'
  });
}

async function getLabTests(doctorId = null) {
  const whereDoctor = doctorId ? 'WHERE lt.doctor_id = @doctorId' : '';

  return query(`
    SELECT lt.test_code AS testCode, p.full_name AS patientName, lt.test_type AS testType,
      lt.ordered_date AS orderedDate, lt.status, lt.result_summary AS resultSummary,
      doc.full_name AS doctorName
    FROM LabTests lt
    INNER JOIN MedicalRecords mr ON mr.record_id = lt.record_id
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    INNER JOIN Doctors doc ON doc.doctor_id = lt.doctor_id
    ${whereDoctor}
    ORDER BY lt.ordered_date DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function getBilling() {
  return query(`
    SELECT b.billing_id AS billingId, b.admission_id AS admissionId, b.bill_code AS billCode,
      p.full_name AS patientName, b.consultation_fee AS consultationFee,
      b.bed_fee AS bedFee, b.medicine_fee AS medicineFee, b.lab_fee AS labFee,
      b.insurance_covered AS insuranceCovered, b.total_amount AS totalAmount, b.payment_status AS paymentStatus
    FROM Billing b
    INNER JOIN Admissions a ON a.admission_id = b.admission_id
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    ORDER BY b.created_at DESC
  `);
}

async function createBilling(data) {
  const consultationFee = Number(data.consultationFee || 0);
  const bedFee = Number(data.bedFee || 0);
  const medicineFee = Number(data.medicineFee || 0);
  const labFee = Number(data.labFee || 0);
  const insuranceCovered = Number(data.insuranceCovered || 0);
  const totalAmount = Math.max(consultationFee + bedFee + medicineFee + labFee - insuranceCovered, 0);

  await execute(`
    INSERT INTO Billing (
      bill_code, admission_id, consultation_fee, bed_fee, medicine_fee, lab_fee,
      insurance_covered, total_amount, payment_status
    )
    VALUES (
      CONCAT('VP', FORMAT(GETDATE(), 'yyMMddHHmmss')),
      @admissionId, @consultationFee, @bedFee, @medicineFee, @labFee,
      @insuranceCovered, @totalAmount, @paymentStatus
    )
  `, {
    admissionId: Number(data.admissionId),
    consultationFee,
    bedFee,
    medicineFee,
    labFee,
    insuranceCovered,
    totalAmount,
    paymentStatus: data.paymentStatus || 'Chưa thanh toán'
  });
}

async function getDischarges(doctorId = null) {
  const whereDoctor = doctorId ? 'WHERE a.doctor_id = @doctorId' : '';

  return query(`
    SELECT d.discharge_id AS dischargeId, p.patient_code AS patientCode, p.full_name AS patientName, 
      d.discharge_condition AS dischargeCondition, d.discharge_date AS dischargeDate, 
      d.treatment_summary AS treatmentSummary, d.total_cost AS totalCost, d.payment_status AS paymentStatus,
      (SELECT TOP 1 record_id FROM MedicalRecords WHERE admission_id = a.admission_id) AS recordId
    FROM Discharges d
    INNER JOIN Admissions a ON a.admission_id = d.admission_id
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    ${whereDoctor}
    ORDER BY d.discharge_date DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function createDischarge(data, doctorId = null) {
  const dischargeDate = data.dischargeDate ? new Date(data.dischargeDate) : new Date();
  const whereDoctor = doctorId ? 'AND doctor_id = @doctorId' : '';
  const params = {
    admissionId: Number(data.admissionId),
    dischargeCondition: data.dischargeCondition,
    dischargeDate,
    treatmentSummary: data.treatmentSummary,
    paymentStatus: data.paymentStatus || 'ChÆ°a thanh toÃ¡n'
  };
  if (doctorId) params.doctorId = Number(doctorId);

  await execute(`
    DECLARE @totalCost DECIMAL(18,2);

    SELECT @totalCost = ISNULL(SUM(total_amount), 0)
    FROM Billing
    WHERE admission_id = @admissionId;

    IF NOT EXISTS (
      SELECT 1 FROM Admissions
      WHERE admission_id = @admissionId ${whereDoctor}
    )
    BEGIN
      THROW 51002, N'Bạn không có quyền xuất viện lượt điều trị này.', 1;
    END;

    INSERT INTO Discharges (
      admission_id, discharge_condition, discharge_date, treatment_summary,
      total_cost, payment_status
    )
    VALUES (
      @admissionId, @dischargeCondition, @dischargeDate, @treatmentSummary,
      @totalCost, @paymentStatus
    );

    UPDATE Admissions
    SET status = N'Chờ xuất viện'
    WHERE admission_id = @admissionId;
  `, params);
}

async function getUsers() {
  return query(`
    SELECT u.user_id AS userId, u.username, u.email, u.full_name AS fullName,
      r.role_name AS roleName, r.role_code AS roleCode, u.status, u.created_at AS createdAt
    FROM Users u
    INNER JOIN Roles r ON r.role_id = u.role_id
    ORDER BY u.created_at DESC
  `);
}

async function getBHYTList() {
  return query(`
    SELECT p.patient_id AS patientId, p.patient_code AS patientCode, p.full_name AS fullName,
      p.health_insurance_no AS insuranceNo, p.phone, p.identity_number AS identityNumber,
      a.admission_id AS admissionId, a.status AS admissionStatus, d.department_name AS departmentName,
      (SELECT SUM(total_amount) FROM Billing WHERE admission_id = a.admission_id) AS totalBill,
      (SELECT SUM(insurance_covered) FROM Billing WHERE admission_id = a.admission_id) AS totalCovered
    FROM Patients p
    LEFT JOIN Admissions a ON a.patient_id = p.patient_id AND a.status <> N'Đã xuất viện' AND a.status <> N'Đã hủy'
    LEFT JOIN Departments d ON d.department_id = a.department_id
    WHERE p.health_insurance_no IS NOT NULL OR a.admission_id IS NOT NULL
    ORDER BY p.created_at DESC
  `);
}

async function getLengthOfStay() {
  return query(`
    SELECT p.patient_code AS patientCode, p.full_name AS patientName,
      a.admission_date AS admissionDate, d.department_name AS departmentName,
      r.room_code AS roomCode, b.bed_code AS bedCode,
      DATEDIFF(DAY, a.admission_date, GETDATE()) AS daysStayed,
      a.status
    FROM Admissions a
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    LEFT JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    WHERE a.status NOT IN (N'Đã xuất viện', N'Đã hủy')
    ORDER BY daysStayed DESC
  `);
}

async function updateDischargePayment(dischargeId, paymentStatus) {
  return execute(`
    UPDATE Discharges
    SET payment_status = @paymentStatus
    WHERE discharge_id = @dischargeId
  `, { dischargeId: Number(dischargeId), paymentStatus });
}

async function getDoctorDuties() {
  return query(`
    SELECT d.doctor_id AS doctorId, d.doctor_code AS doctorCode, d.full_name AS fullName,
      d.specialty, d.shift_name AS shiftName, dept.department_name AS departmentName,
      (SELECT COUNT(*) FROM Admissions WHERE doctor_id = d.doctor_id AND status = N'Đang điều trị') AS activePatients
    FROM Doctors d
    LEFT JOIN Departments dept ON dept.department_id = d.department_id
    ORDER BY dept.department_name, d.full_name
  `);
}

async function getStaffPerformance() {
  return query(`
    SELECT u.user_id AS userId, u.full_name AS fullName, r.role_name AS roleName,
      CASE 
        WHEN r.role_code = 'DOCTOR' THEN (
          SELECT COUNT(*) 
          FROM MedicalRecords mr 
          INNER JOIN Admissions a ON a.admission_id = mr.admission_id 
          INNER JOIN Doctors d ON d.doctor_id = a.doctor_id
          WHERE d.full_name = u.full_name
        )
        WHEN r.role_code = 'RECEPTIONIST' THEN (
          SELECT COUNT(*) FROM Admissions WHERE created_at >= DATEADD(MONTH, -1, GETDATE())
        )
        ELSE 0
      END AS totalTasks,
      u.status
    FROM Users u
    INNER JOIN Roles r ON r.role_id = u.role_id
    WHERE r.role_code <> 'PATIENT'
    ORDER BY totalTasks DESC
  `);
}

async function updateDoctorDuty(doctorId, data) {
  return execute(`
    UPDATE Doctors
    SET department_id = @departmentId,
        shift_name = @shiftName
    WHERE doctor_id = @doctorId
  `, {
    doctorId: Number(doctorId),
    departmentId: data.departmentId ? Number(data.departmentId) : null,
    shiftName: data.shiftName || null
  });
}

async function removeDoctorDuty(doctorId) {
  return execute(`
    UPDATE Doctors
    SET department_id = NULL,
        shift_name = NULL
    WHERE doctor_id = @doctorId
  `, { doctorId: Number(doctorId) });
}

async function getInpatientStats() {
  return query(`
    SELECT d.department_name AS departmentName, 
      COUNT(a.admission_id) AS patientCount,
      (SELECT COUNT(*) FROM Beds b INNER JOIN Rooms r ON r.room_id = b.room_id WHERE r.department_id = d.department_id) AS totalBeds
    FROM Departments d
    LEFT JOIN Admissions a ON a.department_id = d.department_id AND a.status = N'Đang điều trị'
    GROUP BY d.department_id, d.department_name
  `);
}

async function getRevenueStats() {
  return query(`
    SELECT FORMAT(created_at, 'yyyy-MM') AS month,
      SUM(total_amount) AS revenue,
      SUM(insurance_covered) AS insurance
    FROM Billing
    GROUP BY FORMAT(created_at, 'yyyy-MM')
    ORDER BY month DESC
  `);
}

async function getVisitStats() {
  return query(`
    SELECT CAST(admission_date AS date) AS date, COUNT(*) AS visitCount
    FROM Admissions
    WHERE admission_date >= DATEADD(DAY, -30, GETDATE())
    GROUP BY CAST(admission_date AS date)
    ORDER BY date DESC
  `);
}

async function getMedicineUsageStats() {
  return query(`
    SELECT medicine_name AS medicineName, SUM(quantity) AS totalUsed,
      COUNT(DISTINCT prescription_id) AS prescriptionCount
    FROM PrescriptionItems
    GROUP BY medicine_name
    ORDER BY totalUsed DESC
  `);
}

module.exports = {
  getMedicalRecords,
  getMedicalRecordDetail,
  getDepartmentsOverview,
  getDepartmentDetail,
  getDepartmentRooms,
  getDepartmentBeds,
  getDepartmentPatients,
  getDepartmentStaff,
  createRoom,
  updateRoom,
  deleteRoom,
  createBed,
  updateBed,
  deleteBed,
  getBeds,
  getAvailableBeds,
  getActiveAdmissions,
  transferBed,
  getDoctors,
  getTreatmentDoctorsOverview,
  getDoctorByUser,
  getTreatments,
  updateTreatmentStatus,
  getNursingWorklist,
  getPrescriptions,
  getActiveMedicalRecords,
  createPrescription,
  getLabTests,
  getBilling,
  createBilling,
  getDischarges,
  createDischarge,
  getUsers,
  getBHYTList,
  getLengthOfStay,
  updateDischargePayment,
  getDoctorDuties,
  getStaffPerformance,
  updateDoctorDuty,
  removeDoctorDuty,
  getInpatientStats,
  getRevenueStats,
  getVisitStats,
  getMedicineUsageStats
};
