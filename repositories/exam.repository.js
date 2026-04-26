const { query, execute } = require('./base.repository');

async function ensureExamTicketsTable() {
  await execute(`
    IF OBJECT_ID(N'ExamTickets', N'U') IS NULL
    BEGIN
      CREATE TABLE ExamTickets (
        ticket_id INT IDENTITY(1,1) PRIMARY KEY,
        ticket_code VARCHAR(30) NOT NULL UNIQUE,
        patient_id INT NOT NULL,
        department_id INT NOT NULL,
        doctor_id INT NOT NULL,
        exam_type NVARCHAR(80) NOT NULL,
        reason NVARCHAR(1000) NOT NULL,
        is_urgent BIT NOT NULL DEFAULT 0,
        status NVARCHAR(50) NOT NULL DEFAULT N'Đã lập phiếu',
        created_by INT NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_ExamTickets_Patient FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
        CONSTRAINT FK_ExamTickets_Department FOREIGN KEY (department_id) REFERENCES Departments(department_id),
        CONSTRAINT FK_ExamTickets_Doctor FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id),
        CONSTRAINT FK_ExamTickets_User FOREIGN KEY (created_by) REFERENCES Users(user_id)
      );
    END;
  `);
}

async function createExamTicket(data, createdBy) {
  await ensureExamTicketsTable();

  const rows = await query(`
    DECLARE @nextNumber INT;
    SELECT @nextNumber = ISNULL(MAX(TRY_CONVERT(INT, SUBSTRING(ticket_code, 3, 20))), 0) + 1
    FROM ExamTickets;

    DECLARE @ticketCode VARCHAR(30) = CONCAT('PK', RIGHT(CONCAT('000000', @nextNumber), 6));

    INSERT INTO ExamTickets (
      ticket_code, patient_id, department_id, doctor_id, exam_type, reason, is_urgent, status, created_by
    )
    OUTPUT INSERTED.ticket_id AS ticketId, INSERTED.ticket_code AS ticketCode
    VALUES (
      @ticketCode, @patientId, @departmentId, @doctorId, @examType, @reason, @isUrgent, N'Đã lập phiếu', @createdBy
    );
  `, {
    patientId: Number(data.patientId),
    departmentId: Number(data.departmentId),
    doctorId: Number(data.doctorId),
    examType: data.examType || 'Khám thường',
    reason: data.reason,
    isUrgent: data.isUrgent ? 1 : 0,
    createdBy: createdBy || null
  });

  return rows[0];
}

async function getRecentExamTickets(limit = 20) {
  await ensureExamTicketsTable();

  return query(`
    SELECT TOP (@limit)
      et.ticket_id AS ticketId,
      et.ticket_code AS ticketCode,
      p.full_name AS patientName,
      d.department_name AS departmentName,
      doc.full_name AS doctorName,
      et.exam_type AS examType,
      et.reason,
      et.is_urgent AS isUrgent,
      et.status,
      et.created_at AS createdAt
    FROM ExamTickets et
    INNER JOIN Patients p ON p.patient_id = et.patient_id
    INNER JOIN Departments d ON d.department_id = et.department_id
    INNER JOIN Doctors doc ON doc.doctor_id = et.doctor_id
    ORDER BY et.created_at DESC
  `, { limit: Number(limit) });
}

async function getPendingExamTicketCount(doctorId) {
  await ensureExamTicketsTable();
  const rows = await query(`
    SELECT COUNT(*) AS count
    FROM ExamTickets
    WHERE doctor_id = @doctorId AND status = N'Đã lập phiếu'
  `, { doctorId: Number(doctorId) });
  return rows[0]?.count || 0;
}

module.exports = {
  createExamTicket,
  getRecentExamTickets,
  getPendingExamTicketCount
};
