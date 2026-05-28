const { query, execute, withTransaction } = require('./base.repository');

async function ensureTreatmentBillingSchema() {
  await execute(`
    IF OBJECT_ID(N'dbo.ServiceCatalog', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.ServiceCatalog (
        service_id INT IDENTITY(1,1) PRIMARY KEY,
        service_code VARCHAR(30) NOT NULL UNIQUE,
        service_name NVARCHAR(180) NOT NULL,
        service_group NVARCHAR(150) NOT NULL,
        department_name NVARCHAR(150),
        unit NVARCHAR(50) NOT NULL DEFAULT N'lần',
        unit_price DECIMAL(18,2) NOT NULL DEFAULT 0,
        insurance_rate INT NOT NULL DEFAULT 0,
        status NVARCHAR(30) NOT NULL DEFAULT N'Đang sử dụng',
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
      );
    END;

    IF OBJECT_ID(N'dbo.MedicineCatalog', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.MedicineCatalog (
        medicine_id INT IDENTITY(1,1) PRIMARY KEY,
        medicine_code VARCHAR(30) NOT NULL UNIQUE,
        medicine_name NVARCHAR(180) NOT NULL,
        medicine_group NVARCHAR(150) NOT NULL DEFAULT N'Khác',
        dosage_form NVARCHAR(100) NOT NULL DEFAULT N'Khác',
        unit NVARCHAR(50) NOT NULL DEFAULT N'viên',
        unit_price DECIMAL(18,2) NOT NULL DEFAULT 0,
        status NVARCHAR(30) NOT NULL DEFAULT N'Đang sử dụng',
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
      );
    END;

    IF OBJECT_ID(N'dbo.InpatientReceipts', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.InpatientReceipts (
        receipt_id INT IDENTITY(1,1) PRIMARY KEY,
        receipt_code VARCHAR(40) NOT NULL UNIQUE,
        patient_id INT NOT NULL,
        admission_id INT NOT NULL,
        record_id INT NULL,
        cashier_user_id INT NOT NULL,
        total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
        paid_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
        payment_method NVARCHAR(80) NOT NULL DEFAULT N'Tiền mặt',
        payment_status NVARCHAR(50) NOT NULL DEFAULT N'Chưa thanh toán',
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
      );
    END;

    IF COL_LENGTH(N'dbo.InpatientReceipts', N'insurance_covered') IS NULL
    BEGIN
      ALTER TABLE dbo.InpatientReceipts
      ADD insurance_covered DECIMAL(18,2) NOT NULL
        CONSTRAINT DF_InpatientReceipts_insurance_covered DEFAULT 0;
    END;

    IF OBJECT_ID(N'dbo.TreatmentCosts', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.TreatmentCosts (
        cost_id INT IDENTITY(1,1) PRIMARY KEY,
        admission_id INT NOT NULL,
        record_id INT NOT NULL,
        source_type NVARCHAR(50) NOT NULL,
        source_id INT NULL,
        source_code VARCHAR(60) NULL,
        incurred_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        cost_type NVARCHAR(80) NOT NULL,
        content NVARCHAR(250) NOT NULL,
        department_name NVARCHAR(150),
        recorded_by NVARCHAR(150),
        quantity DECIMAL(18,2) NOT NULL DEFAULT 1,
        unit_price DECIMAL(18,2) NOT NULL DEFAULT 0,
        amount DECIMAL(18,2) NOT NULL DEFAULT 0,
        status NVARCHAR(50) NOT NULL DEFAULT N'Chờ thực hiện',
        receipt_id INT NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NULL
      );
    END;

    IF OBJECT_ID(N'dbo.InpatientReceiptItems', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.InpatientReceiptItems (
        receipt_item_id INT IDENTITY(1,1) PRIMARY KEY,
        receipt_id INT NOT NULL,
        cost_id INT NOT NULL
      );
    END;
  `);
}

async function syncAdmissionAndBedCosts(admissionId = null) {
  await ensureTreatmentBillingSchema();

  const filter = admissionId ? 'AND a.admission_id = @admissionId' : '';
  const params = admissionId ? { admissionId: Number(admissionId) } : {};

  await execute(`
    MERGE ServiceCatalog AS target
    USING (
      SELECT 'DV000' AS service_code, N'Phí tiếp nhận nội trú' AS service_name,
        N'Nhập viện' AS service_group, CAST(NULL AS NVARCHAR(150)) AS department_name,
        N'lần' AS unit, CAST(150000 AS DECIMAL(18,2)) AS unit_price
      UNION ALL
      SELECT 'DV002', N'Ngày giường nội trú thường', N'Giường bệnh', NULL, N'ngày', CAST(300000 AS DECIMAL(18,2))
      UNION ALL
      SELECT 'DV003', N'Ngày giường hồi sức cấp cứu', N'Giường bệnh', NULL, N'ngày', CAST(750000 AS DECIMAL(18,2))
    ) AS src
    ON target.service_code = src.service_code
    WHEN NOT MATCHED THEN
      INSERT (service_code, service_name, service_group, department_name, unit, unit_price, insurance_rate, status)
      VALUES (src.service_code, src.service_name, src.service_group, src.department_name, src.unit, src.unit_price, 0, N'Đang sử dụng');

    MERGE TreatmentCosts AS target
    USING (
      SELECT a.admission_id, mr.record_id, a.admission_date, d.department_name,
        sc.unit_price
      FROM Admissions a
      INNER JOIN Departments d ON d.department_id = a.department_id
      OUTER APPLY (
        SELECT TOP 1 record_id
        FROM MedicalRecords
        WHERE admission_id = a.admission_id
        ORDER BY record_id DESC
      ) mr
      INNER JOIN ServiceCatalog sc ON sc.service_code = 'DV000'
      WHERE mr.record_id IS NOT NULL
        AND a.status <> N'Đã hủy'
        ${filter}
    ) AS src
    ON target.source_type = N'ADMISSION_FEE' AND target.source_id = src.admission_id
    WHEN MATCHED AND target.status <> N'Đã thanh toán' THEN
      UPDATE SET incurred_at = src.admission_date,
        cost_type = N'Nhập viện',
        content = N'Phí tiếp nhận nội trú',
        department_name = src.department_name,
        recorded_by = N'Hệ thống',
        quantity = 1,
        unit_price = src.unit_price,
        amount = src.unit_price,
        status = N'Đã thực hiện',
        updated_at = SYSDATETIME()
    WHEN NOT MATCHED THEN
      INSERT (
        admission_id, record_id, source_type, source_id, source_code, incurred_at,
        cost_type, content, department_name, recorded_by, quantity, unit_price, amount, status
      )
      VALUES (
        src.admission_id, src.record_id, N'ADMISSION_FEE', src.admission_id, 'ADMISSION',
        src.admission_date, N'Nhập viện', N'Phí tiếp nhận nội trú', src.department_name,
        N'Hệ thống', 1, src.unit_price, src.unit_price, N'Đã thực hiện'
      );

    DELETE tc
    FROM TreatmentCosts tc
    INNER JOIN Admissions a ON a.admission_id = tc.admission_id
    WHERE tc.source_type = N'BED_FEE'
      AND tc.status <> N'Đã thanh toán'
      AND (a.room_id IS NULL OR a.bed_id IS NULL);

    MERGE TreatmentCosts AS target
    USING (
      SELECT a.admission_id, mr.record_id, a.admission_date, d.department_name,
        CASE WHEN d.department_name LIKE N'%Hồi sức%' THEN N'Ngày giường hồi sức cấp cứu' ELSE N'Ngày giường nội trú thường' END AS service_name,
        sc.unit_price,
        CAST(
          CASE
            WHEN DATEDIFF(DAY, CAST(a.admission_date AS DATE), CAST(COALESCE(lastDischarge.discharge_date, GETDATE()) AS DATE)) + 1 < 1 THEN 1
            ELSE DATEDIFF(DAY, CAST(a.admission_date AS DATE), CAST(COALESCE(lastDischarge.discharge_date, GETDATE()) AS DATE)) + 1
          END
          AS DECIMAL(18,2)
        ) AS bed_days
      FROM Admissions a
      INNER JOIN Departments d ON d.department_id = a.department_id
      OUTER APPLY (
        SELECT TOP 1 record_id
        FROM MedicalRecords
        WHERE admission_id = a.admission_id
        ORDER BY record_id DESC
      ) mr
      OUTER APPLY (
        SELECT TOP 1 discharge_date
        FROM Discharges
        WHERE admission_id = a.admission_id
        ORDER BY discharge_date DESC
      ) lastDischarge
      INNER JOIN ServiceCatalog sc ON sc.service_name =
        CASE WHEN d.department_name LIKE N'%Hồi sức%' THEN N'Ngày giường hồi sức cấp cứu' ELSE N'Ngày giường nội trú thường' END
      WHERE mr.record_id IS NOT NULL
        AND a.status <> N'Đã hủy'
        AND a.room_id IS NOT NULL
        AND a.bed_id IS NOT NULL
        ${filter}
    ) AS src
    ON target.source_type = N'BED_FEE' AND target.source_id = src.admission_id
    WHEN MATCHED AND target.status <> N'Đã thanh toán' THEN
      UPDATE SET incurred_at = src.admission_date,
        cost_type = N'Giường bệnh',
        content = src.service_name,
        department_name = src.department_name,
        recorded_by = N'Hệ thống',
        quantity = src.bed_days,
        unit_price = src.unit_price,
        amount = src.bed_days * src.unit_price,
        status = N'Đã thực hiện',
        updated_at = SYSDATETIME()
    WHEN NOT MATCHED THEN
      INSERT (
        admission_id, record_id, source_type, source_id, source_code, incurred_at,
        cost_type, content, department_name, recorded_by, quantity, unit_price, amount, status
      )
      VALUES (
        src.admission_id, src.record_id, N'BED_FEE', src.admission_id, 'BED',
        src.admission_date, N'Giường bệnh', src.service_name, src.department_name,
        N'Hệ thống', src.bed_days, src.unit_price, src.bed_days * src.unit_price, N'Đã thực hiện'
      );
  `, params);
}

async function syncExistingTreatmentCosts() {
  await ensureTreatmentBillingSchema();
  await syncAdmissionAndBedCosts();

  await execute(`
    INSERT INTO TreatmentCosts (
      admission_id, record_id, source_type, source_id, source_code, incurred_at,
      cost_type, content, department_name, recorded_by, quantity, unit_price, amount, status
    )
    SELECT a.admission_id, mr.record_id, N'LAB', lt.lab_test_id, lt.test_code, lt.ordered_date,
      N'Xét nghiệm', lt.test_type, COALESCE(sc.department_name, d.department_name), doc.full_name,
      1,
      COALESCE(sc.unit_price, 0),
      COALESCE(sc.unit_price, 0),
      CASE WHEN lt.status = N'Đã có kết quả' THEN N'Đã thực hiện' ELSE N'Chờ thực hiện' END
    FROM LabTests lt
    INNER JOIN MedicalRecords mr ON mr.record_id = lt.record_id
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    INNER JOIN Doctors doc ON doc.doctor_id = lt.doctor_id
    OUTER APPLY (
      SELECT TOP 1 unit_price, department_name
      FROM ServiceCatalog
      WHERE status = N'Đang sử dụng'
        AND (service_name = lt.test_type OR lt.test_type LIKE CONCAT(N'%', service_name, N'%'))
      ORDER BY CASE WHEN service_name = lt.test_type THEN 0 ELSE 1 END
    ) sc
    WHERE NOT EXISTS (
      SELECT 1 FROM TreatmentCosts tc
      WHERE tc.source_type = N'LAB' AND tc.source_id = lt.lab_test_id
    );

    INSERT INTO TreatmentCosts (
      admission_id, record_id, source_type, source_id, source_code, incurred_at,
      cost_type, content, department_name, recorded_by, quantity, unit_price, amount, status
    )
    SELECT a.admission_id, mr.record_id, N'TREATMENT', ts.schedule_id, NULL, ts.scheduled_time,
      N'Dịch vụ điều trị', ts.treatment_content, d.department_name, ts.assignee_name,
      1,
      COALESCE(sc.unit_price, 0),
      COALESCE(sc.unit_price, 0),
      CASE WHEN ts.status = N'Hoàn thành' THEN N'Đã thực hiện' ELSE N'Chờ thực hiện' END
    FROM TreatmentSchedules ts
    INNER JOIN MedicalRecords mr ON mr.record_id = ts.record_id
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    OUTER APPLY (
      SELECT TOP 1 unit_price
      FROM ServiceCatalog
      WHERE status = N'Đang sử dụng'
        AND (service_name = ts.treatment_content OR ts.treatment_content LIKE CONCAT(N'%', service_name, N'%'))
      ORDER BY CASE WHEN service_name = ts.treatment_content THEN 0 ELSE 1 END
    ) sc
    WHERE NOT EXISTS (
      SELECT 1 FROM TreatmentCosts tc
      WHERE tc.source_type = N'TREATMENT' AND tc.source_id = ts.schedule_id
    );

    INSERT INTO TreatmentCosts (
      admission_id, record_id, source_type, source_id, source_code, incurred_at,
      cost_type, content, department_name, recorded_by, quantity, unit_price, amount, status
    )
    SELECT a.admission_id, mr.record_id, N'PRESCRIPTION_ITEM', pi.item_id, pr.prescription_code, CAST(pr.start_date AS DATETIME2),
      N'Thuốc', pi.medicine_name, d.department_name, doc.full_name,
      pi.quantity,
      COALESCE(mc.unit_price, 0),
      pi.quantity * COALESCE(mc.unit_price, 0),
      N'Chờ thực hiện'
    FROM PrescriptionItems pi
    INNER JOIN Prescriptions pr ON pr.prescription_id = pi.prescription_id
    INNER JOIN MedicalRecords mr ON mr.record_id = pr.record_id
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    INNER JOIN Doctors doc ON doc.doctor_id = pr.doctor_id
    OUTER APPLY (
      SELECT TOP 1 unit_price
      FROM MedicineCatalog
      WHERE medicine_name = pi.medicine_name
      ORDER BY medicine_id
    ) mc
    WHERE NOT EXISTS (
      SELECT 1 FROM TreatmentCosts tc
      WHERE tc.source_type = N'PRESCRIPTION_ITEM' AND tc.source_id = pi.item_id
    );
  `);
}

async function getAdmissionCostSummary(filters = {}) {
  await syncExistingTreatmentCosts();

  const pageSize = Number(filters.pageSize || 0);
  const page = Math.max(Number(filters.page || 1), 1);
  const offset = (page - 1) * pageSize;
  const params = {};
  const whereClauses = [
    "admissionStatus <> N'Đã xuất viện'",
    "ISNULL(dischargePaymentStatus, N'') <> N'Đã thanh toán'"
  ];

  if (filters.search) {
    whereClauses.push(`(
      patientCode LIKE @search
      OR patientName LIKE @search
      OR departmentName LIKE @search
      OR doctorName LIKE @search
    )`);
    params.search = `%${filters.search}%`;
  }

  if (pageSize > 0) {
    params.offset = offset;
    params.pageSize = pageSize;
  }

  const whereClause = whereClauses.length ? `WHERE ${whereClauses.join('\n      AND ')}` : '';
  const pagingClause = pageSize > 0 ? 'OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY' : '';

  return query(`
    WITH costSummary AS (
      SELECT a.admission_id AS admissionId, mr.record_id AS recordId,
        p.patient_id AS patientId, p.patient_code AS patientCode, p.full_name AS patientName,
        d.department_name AS departmentName, doc.full_name AS doctorName,
        a.status AS admissionStatus,
        CASE WHEN discharge.discharge_id IS NULL THEN 0 ELSE 1 END AS hasDischargeRecord,
        discharge.payment_status AS dischargePaymentStatus,
        COUNT(tc.cost_id) AS costCount,
        SUM(CASE WHEN tc.status = N'Chờ thực hiện' THEN tc.amount ELSE 0 END) AS waitingAmount,
        SUM(CASE WHEN tc.status = N'Đã thực hiện' THEN tc.amount ELSE 0 END) AS readyAmount,
        SUM(CASE WHEN tc.status = N'Đã tính phí' THEN tc.amount ELSE 0 END) AS chargedAmount,
        COALESCE(receiptStats.paidAmount, 0) + SUM(CASE WHEN tc.status = N'Đã thanh toán' THEN tc.amount ELSE 0 END) AS paidAmount,
        CASE
          WHEN SUM(CASE WHEN tc.status IN (N'Đã thực hiện', N'Đã tính phí') THEN tc.amount ELSE 0 END) - COALESCE(receiptStats.paidAmount, 0) < 0 THEN 0
          ELSE SUM(CASE WHEN tc.status IN (N'Đã thực hiện', N'Đã tính phí') THEN tc.amount ELSE 0 END) - COALESCE(receiptStats.paidAmount, 0)
        END AS payableAmount,
        MAX(tc.incurred_at) AS latestCostAt
      FROM TreatmentCosts tc
      INNER JOIN Admissions a ON a.admission_id = tc.admission_id
      INNER JOIN Patients p ON p.patient_id = a.patient_id
      INNER JOIN Departments d ON d.department_id = a.department_id
      INNER JOIN Doctors doc ON doc.doctor_id = a.doctor_id
      LEFT JOIN MedicalRecords mr ON mr.record_id = tc.record_id
      OUTER APPLY (
        SELECT TOP 1 discharge_id, payment_status
        FROM Discharges
        WHERE admission_id = a.admission_id
        ORDER BY discharge_date DESC, discharge_id DESC
      ) discharge
      OUTER APPLY (
        SELECT SUM(paid_amount + insurance_covered) AS paidAmount
        FROM (
          SELECT DISTINCT r.receipt_id, r.paid_amount, r.insurance_covered
          FROM InpatientReceipts r
          INNER JOIN InpatientReceiptItems ri ON ri.receipt_id = r.receipt_id
          INNER JOIN TreatmentCosts linkedCost ON linkedCost.cost_id = ri.cost_id
          WHERE r.admission_id = a.admission_id
            AND linkedCost.status IN (N'Đã thực hiện', N'Đã tính phí')
        ) paidReceipts
      ) receiptStats
      GROUP BY a.admission_id, mr.record_id, p.patient_id, p.patient_code, p.full_name, d.department_name, doc.full_name, a.status, discharge.discharge_id, discharge.payment_status, receiptStats.paidAmount
    )
    SELECT *, COUNT(1) OVER() AS totalRows
    FROM costSummary
    ${whereClause}
    ORDER BY latestCostAt DESC
    ${pagingClause}
  `, params);
}

async function getCostsByAdmission(admissionId) {
  await syncExistingTreatmentCosts();

  return query(`
    SELECT cost_id AS costId, admission_id AS admissionId, record_id AS recordId,
      incurred_at AS incurredAt, cost_type AS costType, content, department_name AS departmentName,
      recorded_by AS recordedBy, quantity, unit_price AS unitPrice, amount, status, receipt_id AS receiptId
    FROM TreatmentCosts
    WHERE admission_id = @admissionId
    ORDER BY incurred_at DESC, cost_id DESC
  `, { admissionId: Number(admissionId) });
}

async function getCostsByRecord(recordId) {
  await syncExistingTreatmentCosts();

  return query(`
    SELECT cost_id AS costId, incurred_at AS incurredAt, cost_type AS costType, content,
      department_name AS departmentName, recorded_by AS recordedBy, quantity,
      unit_price AS unitPrice, amount, status
    FROM TreatmentCosts
    WHERE record_id = @recordId
    ORDER BY incurred_at DESC, cost_id DESC
  `, { recordId: Number(recordId) });
}

async function getCostsByPatient(patientId) {
  await syncExistingTreatmentCosts();

  return query(`
    SELECT tc.cost_id AS costId, tc.incurred_at AS incurredAt, tc.cost_type AS costType,
      tc.content, tc.department_name AS departmentName, tc.recorded_by AS recordedBy,
      tc.quantity, tc.unit_price AS unitPrice, tc.amount, tc.status,
      a.admission_id AS admissionId, mr.record_code AS recordCode
    FROM TreatmentCosts tc
    INNER JOIN Admissions a ON a.admission_id = tc.admission_id
    LEFT JOIN MedicalRecords mr ON mr.record_id = tc.record_id
    WHERE a.patient_id = @patientId
    ORDER BY tc.incurred_at DESC, tc.cost_id DESC
  `, { patientId: Number(patientId) });
}

async function getReceiptsByPatient(patientId) {
  await ensureTreatmentBillingSchema();

  return query(`
    SELECT r.receipt_id AS receiptId, r.receipt_code AS receiptCode, r.total_amount AS totalAmount,
      r.paid_amount AS paidAmount, r.insurance_covered AS insuranceCovered,
      r.payment_method AS paymentMethod, r.payment_status AS paymentStatus,
      r.created_at AS createdAt, u.full_name AS cashierName
    FROM InpatientReceipts r
    INNER JOIN Users u ON u.user_id = r.cashier_user_id
    WHERE r.patient_id = @patientId
    ORDER BY r.created_at DESC
  `, { patientId: Number(patientId) });
}

async function getPendingMedicineConfirmations() {
  await syncExistingTreatmentCosts();

  return query(`
    SELECT tc.cost_id AS costId, tc.incurred_at AS incurredAt, tc.content,
      tc.department_name AS departmentName, tc.recorded_by AS prescribedBy,
      tc.quantity, tc.unit_price AS unitPrice, tc.amount, tc.status,
      p.patient_code AS patientCode, p.full_name AS patientName,
      mr.record_code AS recordCode, pr.prescription_code AS prescriptionCode
    FROM TreatmentCosts tc
    INNER JOIN Admissions a ON a.admission_id = tc.admission_id
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    INNER JOIN MedicalRecords mr ON mr.record_id = tc.record_id
    LEFT JOIN PrescriptionItems pi ON pi.item_id = tc.source_id AND tc.source_type = N'PRESCRIPTION_ITEM'
    LEFT JOIN Prescriptions pr ON pr.prescription_id = pi.prescription_id
    WHERE tc.source_type = N'PRESCRIPTION_ITEM'
      AND tc.status = N'Chờ thực hiện'
    ORDER BY tc.incurred_at DESC, tc.cost_id DESC
  `);
}

async function confirmMedicineCost(costId, confirmedBy) {
  await ensureTreatmentBillingSchema();

  await execute(`
    UPDATE TreatmentCosts
    SET status = N'Đã thực hiện',
        recorded_by = @confirmedBy,
        updated_at = SYSDATETIME()
    WHERE cost_id = @costId
      AND source_type = N'PRESCRIPTION_ITEM'
      AND status = N'Chờ thực hiện';

    IF @@ROWCOUNT = 0
    BEGIN
      THROW 51043, N'Không tìm thấy thuốc chờ Dược xác nhận.', 1;
    END;
  `, {
    costId: Number(costId),
    confirmedBy: confirmedBy || 'Dược'
  });
}

async function createReceipt(data, cashierUserId) {
  await ensureTreatmentBillingSchema();

  const admissionId = Number(data.admissionId);
  const paidAmountInput = Number(data.paidAmount || 0);
  const insuranceCoveredInput = data.insuranceCovered === undefined
    ? null
    : Number(data.insuranceCovered || 0);
  const paymentMethod = data.paymentMethod || 'Tiền mặt';

  return withTransaction(async (tx) => {
    const receiptRows = await tx.query(`
      DECLARE @chargeableAmount DECIMAL(18,2);
      DECLARE @paidBefore DECIMAL(18,2);
      DECLARE @totalAmount DECIMAL(18,2);
      DECLARE @insuranceCovered DECIMAL(18,2) = @inputInsuranceCovered;
      DECLARE @patientId INT;
      DECLARE @recordId INT;
      DECLARE @receiptId INT;
      DECLARE @paymentStatus NVARCHAR(50);
      DECLARE @paidAmount DECIMAL(18,2) = @inputPaidAmount;

      SELECT @patientId = a.patient_id, @recordId = mr.record_id
      FROM Admissions a
      LEFT JOIN MedicalRecords mr ON mr.admission_id = a.admission_id
      WHERE a.admission_id = @admissionId;

      SELECT @chargeableAmount = ISNULL(SUM(amount), 0)
      FROM TreatmentCosts
      WHERE admission_id = @admissionId
        AND status IN (N'Đã thực hiện', N'Đã tính phí');

      SELECT @paidBefore = ISNULL(SUM(paid_amount + insurance_covered), 0)
      FROM (
        SELECT DISTINCT r.receipt_id, r.paid_amount, r.insurance_covered
        FROM InpatientReceipts r
        INNER JOIN InpatientReceiptItems ri ON ri.receipt_id = r.receipt_id
        INNER JOIN TreatmentCosts linkedCost ON linkedCost.cost_id = ri.cost_id
        WHERE r.admission_id = @admissionId
          AND linkedCost.status IN (N'Đã thực hiện', N'Đã tính phí')
      ) paidReceipts;

      SET @totalAmount = CASE
        WHEN @chargeableAmount - @paidBefore < 0 THEN 0
        ELSE @chargeableAmount - @paidBefore
      END;

      IF @totalAmount <= 0
      BEGIN
        THROW 51041, N'Không có chi phí đã thực hiện để lập phiếu thu.', 1;
      END;

      IF @insuranceCovered IS NULL SET @insuranceCovered = ROUND(@totalAmount * 0.2, 0);
      IF @insuranceCovered < 0 SET @insuranceCovered = 0;
      IF @insuranceCovered > @totalAmount SET @insuranceCovered = @totalAmount;

      IF @paidAmount < 0 SET @paidAmount = 0;
      IF @paidAmount > @totalAmount - @insuranceCovered SET @paidAmount = @totalAmount - @insuranceCovered;

      SET @paymentStatus = CASE
        WHEN @paidAmount + @insuranceCovered >= @totalAmount THEN N'Đã thanh toán'
        WHEN @paidAmount > 0 THEN N'Một phần'
        ELSE N'Chưa thanh toán'
      END;

      INSERT INTO InpatientReceipts (
        receipt_code, patient_id, admission_id, record_id, cashier_user_id,
        total_amount, paid_amount, insurance_covered, payment_method, payment_status
      )
      VALUES (
        CONCAT('PT', FORMAT(SYSDATETIME(), 'yyMMddHHmmssfff')),
        @patientId, @admissionId, @recordId, @cashierUserId,
        @totalAmount, @paidAmount, @insuranceCovered, @paymentMethod, @paymentStatus
      );

      SET @receiptId = SCOPE_IDENTITY();

      INSERT INTO InpatientReceiptItems (receipt_id, cost_id)
      SELECT @receiptId, cost_id
      FROM TreatmentCosts
      WHERE admission_id = @admissionId
        AND status IN (N'Đã thực hiện', N'Đã tính phí');

      UPDATE TreatmentCosts
      SET status = CASE WHEN @paymentStatus = N'Đã thanh toán' THEN N'Đã thanh toán' ELSE N'Đã tính phí' END,
          receipt_id = @receiptId,
          updated_at = SYSDATETIME()
      WHERE cost_id IN (
        SELECT cost_id FROM InpatientReceiptItems WHERE receipt_id = @receiptId
      );

      IF @paymentStatus = N'Đã thanh toán'
        AND EXISTS (SELECT 1 FROM Discharges WHERE admission_id = @admissionId)
      BEGIN
        UPDATE Discharges
        SET payment_status = N'Đã thanh toán'
        WHERE admission_id = @admissionId;

        UPDATE MedicalRecords
        SET status = N'Đã xuất viện',
            updated_at = SYSDATETIME()
        WHERE admission_id = @admissionId
          AND status <> N'Hoàn tất';

        UPDATE b
        SET status = N'Trống'
        FROM Beds b
        INNER JOIN Admissions a ON a.bed_id = b.bed_id
        WHERE a.admission_id = @admissionId;

        UPDATE Admissions
        SET status = N'Đã xuất viện'
        WHERE admission_id = @admissionId
          AND status = N'Chờ xuất viện';
      END;

      SELECT @receiptId AS receiptId;
    `, {
      admissionId,
      inputPaidAmount: paidAmountInput,
      inputInsuranceCovered: Number.isFinite(insuranceCoveredInput) ? insuranceCoveredInput : null,
      paymentMethod,
      cashierUserId: Number(cashierUserId)
    });

    return receiptRows[0];
  });
}

async function confirmDischarge(admissionId) {
  await ensureTreatmentBillingSchema();

  return execute(`
    DECLARE @PayableAmount DECIMAL(18,2);

    IF NOT EXISTS (
      SELECT 1
      FROM Admissions a
      INNER JOIN Discharges d ON d.admission_id = a.admission_id
      WHERE a.admission_id = @admissionId
        AND a.status = N'Chờ xuất viện'
    )
    BEGIN
      THROW 51044, N'Hồ sơ chưa ở trạng thái chờ xuất viện.', 1;
    END;

    SELECT @PayableAmount = ISNULL(SUM(CASE WHEN status IN (N'Đã thực hiện', N'Đã tính phí') THEN amount ELSE 0 END), 0)
    FROM TreatmentCosts
    WHERE admission_id = @admissionId;

    IF @PayableAmount > 0
    BEGIN
      THROW 51045, N'Bệnh nhân vẫn còn viện phí đến hạn.', 1;
    END;

    UPDATE Discharges
    SET payment_status = N'Đã thanh toán'
    WHERE admission_id = @admissionId;

    UPDATE MedicalRecords
    SET status = N'Đã xuất viện',
        updated_at = SYSDATETIME()
    WHERE admission_id = @admissionId
      AND status <> N'Hoàn tất';

    UPDATE b
    SET status = N'Trống'
    FROM Beds b
    INNER JOIN Admissions a ON a.bed_id = b.bed_id
    WHERE a.admission_id = @admissionId;

    UPDATE Admissions
    SET status = N'Đã xuất viện'
    WHERE admission_id = @admissionId;
  `, { admissionId: Number(admissionId) });
}

async function getReceipt(receiptId) {
  await ensureTreatmentBillingSchema();

  const receiptRows = await query(`
    SELECT r.receipt_id AS receiptId, r.receipt_code AS receiptCode,
      r.total_amount AS totalAmount, r.paid_amount AS paidAmount,
      r.insurance_covered AS insuranceCovered,
      r.payment_method AS paymentMethod, r.payment_status AS paymentStatus,
      r.created_at AS createdAt,
      p.patient_code AS patientCode, p.full_name AS patientName, p.date_of_birth AS dateOfBirth,
      p.gender, p.phone, a.admission_id AS admissionId, mr.record_code AS recordCode,
      d.department_name AS departmentName, u.full_name AS cashierName
    FROM InpatientReceipts r
    INNER JOIN Patients p ON p.patient_id = r.patient_id
    INNER JOIN Admissions a ON a.admission_id = r.admission_id
    LEFT JOIN MedicalRecords mr ON mr.record_id = r.record_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    INNER JOIN Users u ON u.user_id = r.cashier_user_id
    WHERE r.receipt_id = @receiptId
  `, { receiptId: Number(receiptId) });

  const items = await query(`
    SELECT tc.incurred_at AS incurredAt, tc.cost_type AS costType, tc.content,
      tc.department_name AS departmentName, tc.recorded_by AS recordedBy,
      tc.quantity, tc.unit_price AS unitPrice, tc.amount, tc.status
    FROM InpatientReceiptItems ri
    INNER JOIN TreatmentCosts tc ON tc.cost_id = ri.cost_id
    WHERE ri.receipt_id = @receiptId
    ORDER BY tc.incurred_at, tc.cost_id
  `, { receiptId: Number(receiptId) });

  return {
    receipt: receiptRows[0],
    items
  };
}

async function notifyPaymentDue(admissionId, cashierUserId) {
  await ensureTreatmentBillingSchema();

  await execute(`
    DECLARE @userId INT, @patientName NVARCHAR(150), @amount DECIMAL(18,2);

    SELECT @userId = u.user_id, @patientName = p.full_name
    FROM Admissions a
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    LEFT JOIN Users u ON u.patient_id = p.patient_id
    WHERE a.admission_id = @admissionId;

    SELECT @amount = ISNULL(SUM(amount), 0)
    FROM TreatmentCosts
    WHERE admission_id = @admissionId
      AND status IN (N'Đã thực hiện', N'Đã tính phí');

    SELECT @amount = @amount - ISNULL(SUM(paid_amount + insurance_covered), 0)
    FROM (
      SELECT DISTINCT r.receipt_id, r.paid_amount, r.insurance_covered
      FROM InpatientReceipts r
      INNER JOIN InpatientReceiptItems ri ON ri.receipt_id = r.receipt_id
      INNER JOIN TreatmentCosts linkedCost ON linkedCost.cost_id = ri.cost_id
      WHERE r.admission_id = @admissionId
        AND linkedCost.status IN (N'Đã thực hiện', N'Đã tính phí')
    ) paidReceipts;

    IF @amount <= 0
    BEGIN
      THROW 51042, N'Không có viện phí đến hạn để gửi thông báo.', 1;
    END;

    INSERT INTO Notifications (user_id, title, message, type)
    VALUES (
      @userId,
      N'Đến hạn nộp viện phí',
      CONCAT(N'Bệnh nhân ', @patientName, N' có viện phí đến hạn: ', FORMAT(@amount, 'N0'), N' VND. Vui lòng liên hệ quầy thu ngân để thanh toán.'),
      'payment-due'
    );
  `, {
    admissionId: Number(admissionId),
    cashierUserId: Number(cashierUserId)
  });
}

async function recordLabOrderCost(testCode) {
  await ensureTreatmentBillingSchema();

  await execute(`
    INSERT INTO TreatmentCosts (
      admission_id, record_id, source_type, source_id, source_code, incurred_at,
      cost_type, content, department_name, recorded_by, quantity, unit_price, amount, status
    )
    SELECT a.admission_id, mr.record_id, N'LAB', lt.lab_test_id, lt.test_code, lt.ordered_date,
      N'Xét nghiệm', lt.test_type, COALESCE(sc.department_name, d.department_name), doc.full_name,
      1, COALESCE(sc.unit_price, 0), COALESCE(sc.unit_price, 0), N'Chờ thực hiện'
    FROM LabTests lt
    INNER JOIN MedicalRecords mr ON mr.record_id = lt.record_id
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    INNER JOIN Doctors doc ON doc.doctor_id = lt.doctor_id
    OUTER APPLY (
      SELECT TOP 1 unit_price, department_name
      FROM ServiceCatalog
      WHERE status = N'Đang sử dụng'
        AND (service_name = lt.test_type OR lt.test_type LIKE CONCAT(N'%', service_name, N'%'))
      ORDER BY CASE WHEN service_name = lt.test_type THEN 0 ELSE 1 END
    ) sc
    WHERE lt.test_code = @testCode
      AND NOT EXISTS (
        SELECT 1 FROM TreatmentCosts tc
        WHERE tc.source_type = N'LAB' AND tc.source_id = lt.lab_test_id
      );
  `, { testCode });
}

async function markLabPerformed(testCode, recordedBy) {
  await recordLabOrderCost(testCode);

  await execute(`
    UPDATE tc
    SET status = N'Đã thực hiện',
        recorded_by = COALESCE(NULLIF(@recordedBy, ''), recorded_by),
        updated_at = SYSDATETIME()
    FROM TreatmentCosts tc
    INNER JOIN LabTests lt ON lt.lab_test_id = tc.source_id
    WHERE tc.source_type = N'LAB'
      AND lt.test_code = @testCode
      AND tc.status = N'Chờ thực hiện';
  `, { testCode, recordedBy: recordedBy || '' });
}

async function recordPrescriptionCosts(prescriptionCode) {
  await ensureTreatmentBillingSchema();

  await execute(`
    INSERT INTO TreatmentCosts (
      admission_id, record_id, source_type, source_id, source_code, incurred_at,
      cost_type, content, department_name, recorded_by, quantity, unit_price, amount, status
    )
    SELECT a.admission_id, mr.record_id, N'PRESCRIPTION_ITEM', pi.item_id, pr.prescription_code, CAST(pr.start_date AS DATETIME2),
      N'Thuốc', pi.medicine_name, d.department_name, doc.full_name,
      pi.quantity, COALESCE(mc.unit_price, 0), pi.quantity * COALESCE(mc.unit_price, 0), N'Chờ thực hiện'
    FROM PrescriptionItems pi
    INNER JOIN Prescriptions pr ON pr.prescription_id = pi.prescription_id
    INNER JOIN MedicalRecords mr ON mr.record_id = pr.record_id
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    INNER JOIN Doctors doc ON doc.doctor_id = pr.doctor_id
    OUTER APPLY (
      SELECT TOP 1 unit_price
      FROM MedicineCatalog
      WHERE medicine_name = pi.medicine_name
      ORDER BY medicine_id
    ) mc
    WHERE pr.prescription_code = @prescriptionCode
      AND NOT EXISTS (
        SELECT 1 FROM TreatmentCosts tc
        WHERE tc.source_type = N'PRESCRIPTION_ITEM' AND tc.source_id = pi.item_id
      );
  `, { prescriptionCode });
}

async function recordLatestPrescriptionCosts(recordId) {
  await ensureTreatmentBillingSchema();

  const rows = await query(`
    SELECT TOP 1 prescription_code AS prescriptionCode
    FROM Prescriptions
    WHERE record_id = @recordId
    ORDER BY prescription_id DESC
  `, { recordId: Number(recordId) });

  if (rows[0]) {
    await recordPrescriptionCosts(rows[0].prescriptionCode);
  }
}

async function markTreatmentPerformed(scheduleId, recordedBy) {
  await ensureTreatmentBillingSchema();

  await execute(`
    MERGE TreatmentCosts AS target
    USING (
      SELECT a.admission_id, mr.record_id, ts.schedule_id, ts.scheduled_time,
        ts.treatment_content, d.department_name, COALESCE(NULLIF(@recordedBy, ''), ts.assignee_name) AS recorded_by,
        COALESCE(sc.unit_price, 0) AS unit_price
      FROM TreatmentSchedules ts
      INNER JOIN MedicalRecords mr ON mr.record_id = ts.record_id
      INNER JOIN Admissions a ON a.admission_id = mr.admission_id
      INNER JOIN Departments d ON d.department_id = a.department_id
      OUTER APPLY (
        SELECT TOP 1 unit_price
        FROM ServiceCatalog
        WHERE status = N'Đang sử dụng'
          AND (service_name = ts.treatment_content OR ts.treatment_content LIKE CONCAT(N'%', service_name, N'%'))
        ORDER BY CASE WHEN service_name = ts.treatment_content THEN 0 ELSE 1 END
      ) sc
      WHERE ts.schedule_id = @scheduleId
    ) AS src
    ON target.source_type = N'TREATMENT' AND target.source_id = src.schedule_id
    WHEN MATCHED THEN
      UPDATE SET status = N'Đã thực hiện',
        recorded_by = src.recorded_by,
        unit_price = CASE WHEN target.unit_price = 0 THEN src.unit_price ELSE target.unit_price END,
        amount = CASE WHEN target.amount = 0 THEN src.unit_price ELSE target.amount END,
        updated_at = SYSDATETIME()
    WHEN NOT MATCHED THEN
      INSERT (
        admission_id, record_id, source_type, source_id, incurred_at, cost_type,
        content, department_name, recorded_by, quantity, unit_price, amount, status
      )
      VALUES (
        src.admission_id, src.record_id, N'TREATMENT', src.schedule_id, src.scheduled_time,
        N'Dịch vụ điều trị', src.treatment_content, src.department_name, src.recorded_by,
        1, src.unit_price, src.unit_price, N'Đã thực hiện'
      );
  `, { scheduleId: Number(scheduleId), recordedBy: recordedBy || '' });
}

module.exports = {
  ensureTreatmentBillingSchema,
  syncAdmissionAndBedCosts,
  syncExistingTreatmentCosts,
  getAdmissionCostSummary,
  getCostsByAdmission,
  getCostsByRecord,
  getCostsByPatient,
  getReceiptsByPatient,
  getPendingMedicineConfirmations,
  confirmMedicineCost,
  createReceipt,
  confirmDischarge,
  getReceipt,
  notifyPaymentDue,
  recordLabOrderCost,
  markLabPerformed,
  recordLatestPrescriptionCosts,
  markTreatmentPerformed
};
