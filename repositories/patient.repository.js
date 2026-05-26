const { query, execute } = require('./base.repository');

async function getInpatients(filters = {}) {
  const inpatientStatuses = [
    'Chờ xếp giường',
    'Đang điều trị',
    'Theo dõi',
    'Ổn định',
    'Chờ xuất viện'
  ];
  const where = filters.status
    ? ["a.status <> N'Đã hủy'"]
    : [`a.status IN (${inpatientStatuses.map((_, index) => `@inpatientStatus${index}`).join(', ')})`];
  const params = {};

  if (!filters.status) {
    inpatientStatuses.forEach((status, index) => {
      params[`inpatientStatus${index}`] = status;
    });
  }

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
      a.doctor_id AS doctorId, doc.full_name AS doctorName, a.admission_date AS admissionDate, a.status, a.priority_level AS priorityLevel,
      mr.record_id AS recordId, mr.vital_signs AS vitalSigns
    FROM Admissions a
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    LEFT JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    LEFT JOIN MedicalRecords mr ON mr.admission_id = a.admission_id
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

    IF @@ROWCOUNT = 0
    BEGIN
      THROW 51014, N'Không tìm thấy bệnh nhân thuộc phạm vi phụ trách.', 1;
    END;

    UPDATE MedicalRecords
    SET status = @status,
        updated_at = SYSDATETIME()
    WHERE admission_id = @admissionId;
  `, params);
}

async function getPatientDetail(patientId, doctorId = null) {
  if (doctorId) {
    const rows = await query(`
      SELECT TOP 1 p.*,
        a.admission_id, a.admission_date, a.initial_diagnosis, a.initial_condition,
        a.status AS admission_status, a.priority_level, d.department_name, r.room_code, b.bed_code,
        doc.full_name AS doctor_name,
        ap.appointment_id, ap.appointment_code, ap.appointment_time, ap.reason AS appointment_reason,
        ap.status AS appointment_status
      FROM Patients p
      OUTER APPLY (
        SELECT TOP 1 *
        FROM Admissions
        WHERE patient_id = p.patient_id
          AND doctor_id = @doctorId
        ORDER BY admission_date DESC
      ) a
      OUTER APPLY (
        SELECT TOP 1 *
        FROM Appointments
        WHERE patient_id = p.patient_id
          AND doctor_id = @doctorId
          AND status <> N'Đã hủy'
        ORDER BY appointment_time DESC
      ) ap
      LEFT JOIN Departments d ON d.department_id = COALESCE(a.department_id, ap.department_id)
      LEFT JOIN Rooms r ON r.room_id = a.room_id
      LEFT JOIN Beds b ON b.bed_id = a.bed_id
      LEFT JOIN Doctors doc ON doc.doctor_id = COALESCE(a.doctor_id, ap.doctor_id)
      WHERE p.patient_id = @patientId
        AND (a.admission_id IS NOT NULL OR ap.appointment_id IS NOT NULL)
      ORDER BY COALESCE(a.admission_date, ap.appointment_time) DESC
    `, { patientId, doctorId: Number(doctorId) });

    return rows[0];
  }

  const rows = await query(`
    SELECT TOP 1 p.*, a.admission_id, a.admission_date, a.initial_diagnosis, a.initial_condition,
      a.status AS admission_status, a.priority_level, d.department_name, r.room_code, b.bed_code,
      doc.full_name AS doctor_name,
      NULL AS appointment_id, NULL AS appointment_code, NULL AS appointment_time,
      NULL AS appointment_reason, NULL AS appointment_status
    FROM Patients p
    LEFT JOIN Admissions a ON a.patient_id = p.patient_id
    LEFT JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    LEFT JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    WHERE p.patient_id = @patientId
    ORDER BY a.admission_date DESC
  `, { patientId });
  return rows[0];
}

async function getPatientPortal(patientId, filters = {}) {
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

  // Treatments with optional date filter
  let treatmentWhere = "WHERE mr.patient_id = @patientId";
  const treatmentParams = { patientId };
  if (filters.startDate) {
    treatmentWhere += " AND ts.scheduled_time >= @startDate";
    treatmentParams.startDate = filters.startDate;
  }
  if (filters.endDate) {
    treatmentWhere += " AND ts.scheduled_time <= @endDate";
    treatmentParams.endDate = filters.endDate + ' 23:59:59';
  }

  const treatments = await query(`
    SELECT ${filters.startDate || filters.endDate ? '' : 'TOP 10'} ts.scheduled_time AS scheduledTime, ts.treatment_content AS treatmentContent,
      ts.assignee_name AS assigneeName, ts.status, ts.note
    FROM TreatmentSchedules ts
    INNER JOIN MedicalRecords mr ON mr.record_id = ts.record_id
    ${treatmentWhere}
    ORDER BY ts.scheduled_time DESC
  `, treatmentParams);

  // Prescriptions with optional date filter
  let prescriptionWhere = "WHERE mr.patient_id = @patientId";
  const prescriptionParams = { patientId };
  if (filters.startDate) {
    prescriptionWhere += " AND pr.start_date >= @startDate";
    prescriptionParams.startDate = filters.startDate;
  }
  if (filters.endDate) {
    prescriptionWhere += " AND pr.start_date <= @endDate";
    prescriptionParams.endDate = filters.endDate + ' 23:59:59';
  }

  const prescriptions = await query(`
    SELECT ${filters.startDate || filters.endDate ? '' : 'TOP 10'} pi.medicine_name AS medicineName, pi.dosage, pi.frequency, pi.route,
      pr.start_date AS startDate, pr.end_date AS endDate, doc.full_name AS doctorName
    FROM Prescriptions pr
    INNER JOIN PrescriptionItems pi ON pi.prescription_id = pr.prescription_id
    INNER JOIN MedicalRecords mr ON mr.record_id = pr.record_id
    INNER JOIN Doctors doc ON doc.doctor_id = pr.doctor_id
    ${prescriptionWhere}
    ORDER BY pr.start_date DESC
  `, prescriptionParams);

  // Lab Tests with optional date filter
  let labWhere = "WHERE mr.patient_id = @patientId";
  const labParams = { patientId };
  if (filters.startDate) {
    labWhere += " AND lt.ordered_date >= @startDate";
    labParams.startDate = filters.startDate;
  }
  if (filters.endDate) {
    labWhere += " AND lt.ordered_date <= @endDate";
    labParams.endDate = filters.endDate + ' 23:59:59';
  }

  const labTests = await query(`
    SELECT ${filters.startDate || filters.endDate ? '' : 'TOP 10'} lt.test_code AS testCode, lt.test_type AS testType, lt.ordered_date AS orderedDate,
      lt.status, lt.result_summary AS resultSummary
    FROM LabTests lt
    INNER JOIN MedicalRecords mr ON mr.record_id = lt.record_id
    ${labWhere}
    ORDER BY lt.ordered_date DESC
  `, labParams);

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

async function createBooking(data) {
  await execute(`
    DECLARE @patientName NVARCHAR(150);

    IF NOT EXISTS (SELECT 1 FROM Patients WHERE patient_id = @patientId)
    BEGIN
      THROW 51031, N'Không tìm thấy hồ sơ bệnh nhân.', 1;
    END;

    IF NOT EXISTS (
      SELECT 1
      FROM Admissions adm
      INNER JOIN Discharges dis ON dis.admission_id = adm.admission_id
      WHERE adm.patient_id = @patientId
    )
    BEGIN
      THROW 51032, N'Chỉ bệnh nhân đã xuất viện mới được đặt lịch tái khám.', 1;
    END;

    SELECT @patientName = full_name FROM Patients WHERE patient_id = @patientId;

    INSERT INTO FollowUpBookings (patient_id, requested_date, requested_time, department_id, doctor_id, reason)
    VALUES (@patientId, @requestedDate, @requestedTime, @departmentId, @doctorId, @reason);

    INSERT INTO Notifications (title, message, type)
    VALUES (N'Lịch hẹn mới', 
      CONCAT(N'Bệnh nhân ', @patientName, N' đăng ký tái khám ngày ', FORMAT(CAST(@requestedDate AS DATE), 'dd/MM/yyyy')), 
      'booking-new');
  `, {
    patientId: Number(data.patientId),
    requestedDate: data.requestedDate,
    requestedTime: data.requestedTime,
    departmentId: Number(data.departmentId),
    doctorId: data.doctorId ? Number(data.doctorId) : null,
    reason: data.reason || ''
  });
}

async function getBookingHistory(patientId) {
  return query(`
    SELECT b.booking_id AS bookingId, b.requested_date AS requestedDate, b.requested_time AS requestedTime,
      d.department_name AS departmentName, doc.full_name AS doctorName, b.reason, b.status, b.created_at AS createdAt
    FROM FollowUpBookings b
    INNER JOIN Departments d ON d.department_id = b.department_id
    LEFT JOIN Doctors doc ON doc.doctor_id = b.doctor_id
    WHERE b.patient_id = @patientId
    ORDER BY b.requested_date DESC, b.requested_time DESC
  `, { patientId });
}

async function payBilling(billingId, patientId) {
  await execute(`
    DECLARE @patientName NVARCHAR(150), @billCode VARCHAR(40);

    IF NOT EXISTS (
      SELECT 1
      FROM Billing b
      INNER JOIN Admissions a ON a.admission_id = b.admission_id
      WHERE b.billing_id = @billingId
        AND a.patient_id = @patientId
    )
    BEGIN
      THROW 51003, N'Hóa đơn không thuộc hồ sơ bệnh nhân hiện tại.', 1;
    END;
    
    SELECT @patientName = p.full_name, @billCode = b.bill_code
    FROM Billing b
    INNER JOIN Admissions a ON a.admission_id = b.admission_id
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    WHERE b.billing_id = @billingId
      AND p.patient_id = @patientId;

    UPDATE Billing
    SET payment_status = N'Đã thanh toán'
    WHERE billing_id = @billingId;

    INSERT INTO Notifications (title, message, type)
    VALUES (N'Thanh toán viện phí', 
      CONCAT(N'Bệnh nhân ', @patientName, N' đã thanh toán hóa đơn ', @billCode), 
      'payment-success');
  `, {
    billingId: Number(billingId),
    patientId: Number(patientId)
  });
}

async function getNotifications(userId) {
  return query(`
    SELECT notification_id AS id, title, message, type,
      CASE WHEN user_id IS NULL THEN CAST(1 AS bit) ELSE is_read END AS isRead,
      created_at AS createdAt
    FROM Notifications
    WHERE user_id = @userId OR user_id IS NULL
    ORDER BY created_at DESC
  `, { userId });
}

async function getUnreadNotificationCount(userId) {
  const rows = await query(`
    SELECT COUNT(*) AS unreadCount
    FROM Notifications
    WHERE user_id = @userId AND is_read = 0
  `, { userId });
  return rows[0].unreadCount;
}

async function markNotificationsAsRead(userId) {
  await execute(`
    UPDATE Notifications
    SET is_read = 1
    WHERE user_id = @userId
  `, { userId });
}

async function fixGarbledStatuses() {
  await execute(`
    UPDATE FollowUpBookings
    SET status = N'Chờ xác nhận'
    WHERE status LIKE N'Chá»%' OR status LIKE N'Chá»%';
  `);
}

module.exports = {
  getInpatients,
  getPatientDetail,
  getPatientPortal,
  updateAdmissionStatus,
  createSupportRequest,
  createBooking,
  getBookingHistory,
  payBilling,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationsAsRead,
  fixGarbledStatuses,
  createAdmission
};
