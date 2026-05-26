const { query, execute } = require('./base.repository');

async function ensureDoctorNurseAssignmentsTable() {
  await execute(`
    DECLARE @created BIT = 0;

    IF OBJECT_ID('DoctorNurseAssignments', 'U') IS NULL
    BEGIN
      CREATE TABLE DoctorNurseAssignments (
        assignment_id INT IDENTITY(1,1) PRIMARY KEY,
        doctor_id INT NOT NULL,
        nurse_user_id INT NOT NULL,
        department_id INT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT N'Đang phụ trách',
        assigned_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NULL,
        CONSTRAINT FK_DoctorNurseAssignments_Doctors FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id),
        CONSTRAINT FK_DoctorNurseAssignments_Users FOREIGN KEY (nurse_user_id) REFERENCES Users(user_id),
        CONSTRAINT FK_DoctorNurseAssignments_Departments FOREIGN KEY (department_id) REFERENCES Departments(department_id),
        CONSTRAINT UQ_DoctorNurseAssignments_DoctorNurse UNIQUE (doctor_id, nurse_user_id)
      );

      SET @created = 1;
    END;

    IF NOT EXISTS (
      SELECT 1
      FROM sys.indexes
      WHERE name = 'UX_DoctorNurseAssignments_ActiveNurse'
        AND object_id = OBJECT_ID('DoctorNurseAssignments')
    )
    BEGIN
      CREATE UNIQUE INDEX UX_DoctorNurseAssignments_ActiveNurse
      ON DoctorNurseAssignments(nurse_user_id)
      WHERE status = N'Đang phụ trách';
    END;

    IF @created = 1
    BEGIN
      ;WITH activeNurses AS (
        SELECT
          u.user_id,
          u.department_id,
          ROW_NUMBER() OVER (PARTITION BY u.department_id ORDER BY u.full_name, u.user_id) AS nurseRank
        FROM Users u
        INNER JOIN Roles r ON r.role_id = u.role_id
        WHERE r.role_code = 'NURSE'
          AND u.status = N'Hoạt động'
      ),
      activeDoctors AS (
        SELECT
          d.doctor_id,
          d.department_id,
          ROW_NUMBER() OVER (PARTITION BY d.department_id ORDER BY d.full_name, d.doctor_id) AS doctorRank,
          COUNT(*) OVER (PARTITION BY d.department_id) AS doctorCount
        FROM Doctors d
        WHERE d.status = N'Đang làm việc'
      )
      INSERT INTO DoctorNurseAssignments (doctor_id, nurse_user_id, department_id)
      SELECT doc.doctor_id, n.user_id, COALESCE(n.department_id, doc.department_id)
      FROM activeNurses n
      INNER JOIN activeDoctors doc
        ON doc.department_id = n.department_id
       AND doc.doctorRank = ((n.nurseRank - 1) % NULLIF(doc.doctorCount, 0)) + 1;
    END;
  `);
}

async function getDoctorNurseManagement(doctorId) {
  await ensureDoctorNurseAssignmentsTable();

  const [doctorRows, assignedNurses, availableNurses] = await Promise.all([
    query(`
      SELECT TOP 1 d.doctor_id AS doctorId, d.full_name AS doctorName,
        d.doctor_code AS doctorCode, d.department_id AS departmentId,
        dep.department_name AS departmentName
      FROM Doctors d
      LEFT JOIN Departments dep ON dep.department_id = d.department_id
      WHERE d.doctor_id = @doctorId
    `, { doctorId: Number(doctorId) }),
    query(`
      SELECT a.assignment_id AS assignmentId, a.nurse_user_id AS nurseUserId,
        u.full_name AS nurseName, u.username, u.email,
        COALESCE(a.department_id, u.department_id) AS departmentId,
        dep.department_name AS departmentName,
        a.status, a.assigned_at AS assignedAt, a.updated_at AS updatedAt
      FROM DoctorNurseAssignments a
      INNER JOIN Users u ON u.user_id = a.nurse_user_id
      LEFT JOIN Departments dep ON dep.department_id = COALESCE(a.department_id, u.department_id)
      WHERE a.doctor_id = @doctorId
        AND a.status = N'Đang phụ trách'
      ORDER BY u.full_name
    `, { doctorId: Number(doctorId) }),
    query(`
      SELECT u.user_id AS nurseUserId, u.full_name AS nurseName, u.username, u.email,
        u.department_id AS departmentId, dep.department_name AS departmentName
      FROM Users u
      INNER JOIN Roles r ON r.role_id = u.role_id
      LEFT JOIN Departments dep ON dep.department_id = u.department_id
      WHERE r.role_code = 'NURSE'
        AND u.status = N'Hoạt động'
        AND NOT EXISTS (
          SELECT 1
          FROM DoctorNurseAssignments a
          WHERE a.nurse_user_id = u.user_id
            AND a.status = N'Đang phụ trách'
        )
      ORDER BY
        CASE WHEN u.department_id = (SELECT department_id FROM Doctors WHERE doctor_id = @doctorId) THEN 0 ELSE 1 END,
        dep.department_name,
        u.full_name
    `, { doctorId: Number(doctorId) })
  ]);

  return {
    doctor: doctorRows[0] || null,
    assignedNurses,
    availableNurses
  };
}

async function assignNurseToDoctor({ doctorId, nurseUserId }) {
  await ensureDoctorNurseAssignmentsTable();

  return execute(`
    DECLARE @departmentId INT = (
      SELECT TOP 1 department_id
      FROM Doctors
      WHERE doctor_id = @doctorId
    );

    IF @departmentId IS NULL
      THROW 51120, N'Không tìm thấy bác sĩ phụ trách.', 1;

    IF NOT EXISTS (
      SELECT 1
      FROM Users u
      INNER JOIN Roles r ON r.role_id = u.role_id
      WHERE u.user_id = @nurseUserId
        AND r.role_code = 'NURSE'
        AND u.status = N'Hoạt động'
    )
      THROW 51121, N'Không tìm thấy điều dưỡng hợp lệ.', 1;

    UPDATE DoctorNurseAssignments
    SET status = N'Ngừng phụ trách',
        updated_at = SYSDATETIME()
    WHERE nurse_user_id = @nurseUserId
      AND status = N'Đang phụ trách'
      AND doctor_id <> @doctorId;

    MERGE DoctorNurseAssignments AS target
    USING (SELECT @doctorId AS doctor_id, @nurseUserId AS nurse_user_id) AS source
      ON target.doctor_id = source.doctor_id
     AND target.nurse_user_id = source.nurse_user_id
    WHEN MATCHED THEN
      UPDATE SET status = N'Đang phụ trách',
                 department_id = @departmentId,
                 updated_at = SYSDATETIME()
    WHEN NOT MATCHED THEN
      INSERT (doctor_id, nurse_user_id, department_id, status)
      VALUES (@doctorId, @nurseUserId, @departmentId, N'Đang phụ trách');

    UPDATE Users
    SET department_id = COALESCE(department_id, @departmentId),
        updated_at = SYSDATETIME()
    WHERE user_id = @nurseUserId;
  `, {
    doctorId: Number(doctorId),
    nurseUserId: Number(nurseUserId)
  });
}

async function stopNurseAssignment(assignmentId, doctorId) {
  await ensureDoctorNurseAssignmentsTable();

  return execute(`
    UPDATE DoctorNurseAssignments
    SET status = N'Ngừng phụ trách',
        updated_at = SYSDATETIME()
    WHERE assignment_id = @assignmentId
      AND doctor_id = @doctorId;
  `, {
    assignmentId: Number(assignmentId),
    doctorId: Number(doctorId)
  });
}

async function getNurseSupervisor(nurseUserId) {
  await ensureDoctorNurseAssignmentsTable();

  const rows = await query(`
    SELECT TOP 1 a.assignment_id AS assignmentId,
      d.doctor_id AS doctorId, d.full_name AS doctorName, d.doctor_code AS doctorCode,
      COALESCE(a.department_id, d.department_id, u.department_id) AS departmentId,
      dep.department_name AS departmentName,
      a.assigned_at AS assignedAt
    FROM DoctorNurseAssignments a
    INNER JOIN Doctors d ON d.doctor_id = a.doctor_id
    INNER JOIN Users u ON u.user_id = a.nurse_user_id
    LEFT JOIN Departments dep ON dep.department_id = COALESCE(a.department_id, d.department_id, u.department_id)
    WHERE a.nurse_user_id = @nurseUserId
      AND a.status = N'Đang phụ trách'
    ORDER BY a.assigned_at DESC
  `, { nurseUserId: Number(nurseUserId) });

  return rows[0] || null;
}

module.exports = {
  ensureDoctorNurseAssignmentsTable,
  getDoctorNurseManagement,
  assignNurseToDoctor,
  stopNurseAssignment,
  getNurseSupervisor
};
