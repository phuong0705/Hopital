const { query, execute } = require('./base.repository');

async function ensureCashierTables() {
  await execute(`
    IF OBJECT_ID(N'dbo.Appointments', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Appointments (
        appointment_id INT IDENTITY(1,1) PRIMARY KEY,
        appointment_code VARCHAR(40) NOT NULL UNIQUE,
        patient_id INT NULL,
        patient_name NVARCHAR(150) NOT NULL,
        phone VARCHAR(30) NULL,
        department_id INT NULL,
        doctor_id INT NULL,
        appointment_time DATETIME2 NOT NULL,
        reason NVARCHAR(500) NULL,
        status NVARCHAR(50) NOT NULL DEFAULT N'Đã đặt',
        created_by INT NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Appointments_Patients FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
        CONSTRAINT FK_Appointments_Departments FOREIGN KEY (department_id) REFERENCES Departments(department_id),
        CONSTRAINT FK_Appointments_Doctors FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id),
        CONSTRAINT FK_Appointments_Users FOREIGN KEY (created_by) REFERENCES Users(user_id)
      );
    END;

    IF OBJECT_ID(N'dbo.BillingAdjustments', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.BillingAdjustments (
        adjustment_id INT IDENTITY(1,1) PRIMARY KEY,
        adjustment_code VARCHAR(40) NOT NULL UNIQUE,
        billing_id INT NOT NULL,
        adjustment_type NVARCHAR(50) NOT NULL,
        amount DECIMAL(18,2) NOT NULL,
        reason NVARCHAR(500) NOT NULL,
        created_by INT NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_BillingAdjustments_Billing FOREIGN KEY (billing_id) REFERENCES Billing(billing_id),
        CONSTRAINT FK_BillingAdjustments_Users FOREIGN KEY (created_by) REFERENCES Users(user_id)
      );
    END;
  `);
}

async function getCashierSidebarCounts() {
  const rows = await query(`
    DECLARE @appointmentCount INT = 0;
    DECLARE @adjustmentCount INT = 0;

    IF OBJECT_ID(N'dbo.Appointments', N'U') IS NOT NULL
    BEGIN
      SELECT @appointmentCount = COUNT(*)
      FROM Appointments
      WHERE CAST(appointment_time AS date) = CAST(GETDATE() AS date)
        AND status <> N'Đã hủy';
    END;

    IF OBJECT_ID(N'dbo.BillingAdjustments', N'U') IS NOT NULL
    BEGIN
      SELECT @adjustmentCount = COUNT(*)
      FROM BillingAdjustments
      WHERE CAST(created_at AS date) = CAST(GETDATE() AS date);
    END;

    SELECT
      @appointmentCount AS appointmentsToday,
      @adjustmentCount AS adjustmentsToday,
      (SELECT COUNT(*) FROM Billing WHERE payment_status <> N'Đã thanh toán') AS unpaidBills,
      (
        @appointmentCount +
        (SELECT COUNT(*) FROM Admissions WHERE CAST(created_at AS date) = CAST(GETDATE() AS date)) +
        (SELECT COUNT(*) FROM Billing WHERE payment_status <> N'Đã thanh toán')
      ) AS queueCount;
  `);

  return rows[0] || {
    appointmentsToday: 0,
    adjustmentsToday: 0,
    unpaidBills: 0,
    queueCount: 0
  };
}

async function getAppointmentDependencies() {
  const [patients, departments, doctors] = await Promise.all([
    query(`
      SELECT TOP 100 patient_id AS patientId, patient_code AS patientCode, full_name AS fullName, phone
      FROM Patients
      ORDER BY created_at DESC
    `),
    query(`
      SELECT department_id AS departmentId, department_name AS departmentName
      FROM Departments
      WHERE status = N'Hoạt động'
      ORDER BY department_name
    `),
    query(`
      SELECT doctor_id AS doctorId, full_name AS fullName, specialty, department_id AS departmentId
      FROM Doctors
      WHERE status = N'Đang làm việc'
      ORDER BY full_name
    `)
  ]);

  return { patients, departments, doctors };
}

async function getAppointments() {
  await ensureCashierTables();

  return query(`
    SELECT a.appointment_id AS appointmentId, a.appointment_code AS appointmentCode,
      a.patient_id AS patientId, COALESCE(p.patient_code, N'BN mới') AS patientCode,
      a.patient_name AS patientName, a.phone, dep.department_name AS departmentName,
      doc.full_name AS doctorName, a.appointment_time AS appointmentTime,
      a.reason, a.status, u.full_name AS createdBy, a.created_at AS createdAt
    FROM Appointments a
    LEFT JOIN Patients p ON p.patient_id = a.patient_id
    LEFT JOIN Departments dep ON dep.department_id = a.department_id
    LEFT JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    LEFT JOIN Users u ON u.user_id = a.created_by
    ORDER BY
      CASE WHEN a.status = N'Đã đặt' THEN 0 ELSE 1 END,
      a.appointment_time DESC
  `);
}

async function createAppointment(data, userId) {
  await ensureCashierTables();

  await execute(`
    DECLARE @patientName NVARCHAR(150) = COALESCE(NULLIF(@inputPatientName, ''), N'Bệnh nhân chưa định danh');
    DECLARE @phone VARCHAR(30) = NULLIF(@inputPhone, '');

    IF @patientId IS NOT NULL
    BEGIN
      SELECT @patientName = full_name, @phone = COALESCE(NULLIF(phone, ''), @phone)
      FROM Patients
      WHERE patient_id = @patientId;
    END;

    INSERT INTO Appointments (
      appointment_code, patient_id, patient_name, phone, department_id, doctor_id,
      appointment_time, reason, status, created_by
    )
    VALUES (
      CONCAT('LH', FORMAT(SYSDATETIME(), 'yyMMddHHmmss')),
      @patientId, @patientName, @phone, @departmentId, @doctorId,
      @appointmentTime, NULLIF(@reason, ''), N'Đã đặt', @createdBy
    );
  `, {
    patientId: data.patientId ? Number(data.patientId) : null,
    inputPatientName: data.patientName || '',
    inputPhone: data.phone || '',
    departmentId: data.departmentId ? Number(data.departmentId) : null,
    doctorId: data.doctorId ? Number(data.doctorId) : null,
    appointmentTime: data.appointmentTime ? new Date(data.appointmentTime) : new Date(),
    reason: data.reason || '',
    createdBy: Number(userId)
  });
}

async function updateAppointmentStatus(appointmentId, status) {
  await ensureCashierTables();

  const allowedStatuses = ['Đã đặt', 'Đã tiếp nhận', 'Đã hủy'];
  const nextStatus = allowedStatuses.includes(status) ? status : 'Đã đặt';

  await execute(`
    UPDATE Appointments
    SET status = @status
    WHERE appointment_id = @appointmentId
  `, {
    appointmentId: Number(appointmentId),
    status: nextStatus
  });
}

async function getQueue() {
  await ensureCashierTables();

  return query(`
    SELECT *
    FROM (
      SELECT
        CONCAT('A', a.appointment_id) AS queueId,
        N'Lịch hẹn' AS queueType,
        a.appointment_code AS code,
        a.patient_name AS patientName,
        dep.department_name AS departmentName,
        a.appointment_time AS queueTime,
        a.status,
        NULL AS amount,
        '/thu-ngan/dat-lich-hen-kham?activeMenu=cashier-appointments' AS actionHref
      FROM Appointments a
      LEFT JOIN Departments dep ON dep.department_id = a.department_id
      WHERE CAST(a.appointment_time AS date) = CAST(GETDATE() AS date)
        AND a.status <> N'Đã hủy'

      UNION ALL

      SELECT
        CONCAT('N', adm.admission_id) AS queueId,
        N'Tiếp nhận nội trú' AS queueType,
        p.patient_code AS code,
        p.full_name AS patientName,
        dep.department_name AS departmentName,
        adm.created_at AS queueTime,
        adm.status,
        NULL AS amount,
        CONCAT('/patients/', p.patient_id, '?activeMenu=cashier-patient-lookup') AS actionHref
      FROM Admissions adm
      INNER JOIN Patients p ON p.patient_id = adm.patient_id
      LEFT JOIN Departments dep ON dep.department_id = adm.department_id
      WHERE CAST(adm.created_at AS date) = CAST(GETDATE() AS date)

      UNION ALL

      SELECT
        CONCAT('B', b.billing_id) AS queueId,
        N'Thanh toán viện phí' AS queueType,
        b.bill_code AS code,
        p.full_name AS patientName,
        dep.department_name AS departmentName,
        b.created_at AS queueTime,
        b.payment_status AS status,
        b.total_amount AS amount,
        '/billing?activeMenu=cashier-billing' AS actionHref
      FROM Billing b
      INNER JOIN Admissions adm ON adm.admission_id = b.admission_id
      INNER JOIN Patients p ON p.patient_id = adm.patient_id
      LEFT JOIN Departments dep ON dep.department_id = adm.department_id
      WHERE b.payment_status <> N'Đã thanh toán'
    ) q
    ORDER BY q.queueTime DESC
  `);
}

async function getPrintableDocuments() {
  return query(`
    SELECT b.billing_id AS billingId, b.bill_code AS billCode, b.created_at AS createdAt,
      p.patient_code AS patientCode, p.full_name AS patientName, p.phone,
      dep.department_name AS departmentName, b.consultation_fee AS consultationFee,
      b.bed_fee AS bedFee, b.medicine_fee AS medicineFee, b.lab_fee AS labFee,
      b.insurance_covered AS insuranceCovered, b.total_amount AS totalAmount,
      b.payment_status AS paymentStatus
    FROM Billing b
    INNER JOIN Admissions adm ON adm.admission_id = b.admission_id
    INNER JOIN Patients p ON p.patient_id = adm.patient_id
    LEFT JOIN Departments dep ON dep.department_id = adm.department_id
    ORDER BY b.created_at DESC
  `);
}

async function getAdjustments() {
  await ensureCashierTables();

  return query(`
    SELECT adj.adjustment_id AS adjustmentId, adj.adjustment_code AS adjustmentCode,
      adj.adjustment_type AS adjustmentType, adj.amount, adj.reason,
      adj.created_at AS createdAt, b.bill_code AS billCode, p.full_name AS patientName,
      u.full_name AS createdBy
    FROM BillingAdjustments adj
    INNER JOIN Billing b ON b.billing_id = adj.billing_id
    INNER JOIN Admissions adm ON adm.admission_id = b.admission_id
    INNER JOIN Patients p ON p.patient_id = adm.patient_id
    LEFT JOIN Users u ON u.user_id = adj.created_by
    ORDER BY adj.created_at DESC
  `);
}

async function createAdjustment(data, userId) {
  await ensureCashierTables();

  const rawAmount = Math.abs(Number(data.amount || 0));
  const adjustmentType = data.adjustmentType || 'Điều chỉnh giảm';
  const signedAmount = adjustmentType === 'Điều chỉnh tăng' ? rawAmount : -rawAmount;

  await execute(`
    INSERT INTO BillingAdjustments (
      adjustment_code, billing_id, adjustment_type, amount, reason, created_by
    )
    VALUES (
      CONCAT('DC', FORMAT(SYSDATETIME(), 'yyMMddHHmmss')),
      @billingId, @adjustmentType, @amount, @reason, @createdBy
    );

    UPDATE Billing
    SET total_amount = CASE
      WHEN total_amount + @amount < 0 THEN 0
      ELSE total_amount + @amount
    END
    WHERE billing_id = @billingId;
  `, {
    billingId: Number(data.billingId),
    adjustmentType,
    amount: signedAmount,
    reason: data.reason || 'Điều chỉnh viện phí',
    createdBy: Number(userId)
  });
}

async function getCashierShiftReport() {
  await ensureCashierTables();

  const summaryRows = await query(`
    SELECT
      (SELECT COUNT(*) FROM Admissions WHERE CAST(created_at AS date) = CAST(GETDATE() AS date)) AS admissionsToday,
      (SELECT COUNT(*) FROM Appointments WHERE CAST(appointment_time AS date) = CAST(GETDATE() AS date)) AS appointmentsToday,
      (SELECT COUNT(*) FROM Billing WHERE CAST(created_at AS date) = CAST(GETDATE() AS date)) AS billsToday,
      (SELECT COUNT(*) FROM Billing WHERE payment_status <> N'Đã thanh toán') AS unpaidBills,
      (SELECT ISNULL(SUM(total_amount), 0) FROM Billing WHERE CAST(created_at AS date) = CAST(GETDATE() AS date)) AS revenueToday,
      (SELECT ISNULL(SUM(insurance_covered), 0) FROM Billing WHERE CAST(created_at AS date) = CAST(GETDATE() AS date)) AS insuranceToday,
      (SELECT ISNULL(SUM(amount), 0) FROM BillingAdjustments WHERE CAST(created_at AS date) = CAST(GETDATE() AS date)) AS adjustmentsToday
  `);

  const revenueByStatus = await query(`
    SELECT payment_status AS paymentStatus, COUNT(*) AS totalBills, ISNULL(SUM(total_amount), 0) AS totalAmount
    FROM Billing
    WHERE CAST(created_at AS date) = CAST(GETDATE() AS date)
    GROUP BY payment_status
    ORDER BY totalAmount DESC
  `);

  const recentBills = await query(`
    SELECT TOP 15 b.bill_code AS billCode, p.full_name AS patientName,
      b.total_amount AS totalAmount, b.payment_status AS paymentStatus, b.created_at AS createdAt
    FROM Billing b
    INNER JOIN Admissions adm ON adm.admission_id = b.admission_id
    INNER JOIN Patients p ON p.patient_id = adm.patient_id
    WHERE CAST(b.created_at AS date) = CAST(GETDATE() AS date)
    ORDER BY b.created_at DESC
  `);

  return {
    summary: summaryRows[0] || {},
    revenueByStatus,
    recentBills
  };
}

module.exports = {
  ensureCashierTables,
  getCashierSidebarCounts,
  getAppointmentDependencies,
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  getQueue,
  getPrintableDocuments,
  getAdjustments,
  createAdjustment,
  getCashierShiftReport
};
