const { query, execute } = require('./base.repository');

async function findUserByLogin(login) {
  const rows = await query(`
    SELECT TOP 1
      u.user_id AS userId,
      u.username,
      u.email,
      u.password_hash AS passwordHash,
      u.full_name AS fullName,
      u.patient_id AS patientId,
      u.department_id AS departmentId,
      d.department_name AS departmentName,
      u.status,
      r.role_code AS roleCode,
      r.role_name AS roleName
    FROM Users u
    INNER JOIN Roles r ON r.role_id = u.role_id
    LEFT JOIN Departments d ON d.department_id = u.department_id
    WHERE (u.username = @login OR u.email = @login)
  `, { login });

  return rows[0];
}

async function createPatientAccount(data) {
  await execute(`
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;

    DECLARE @roleId INT = (
      SELECT TOP 1 role_id
      FROM Roles
      WHERE role_code = 'PATIENT'
    );

    IF @roleId IS NULL
      THROW 51000, 'Patient role is missing.', 1;

    IF EXISTS (SELECT 1 FROM Users WHERE username = @username OR email = @email)
      THROW 51001, 'Username or email already exists.', 1;

    DECLARE @nextPatientNumber INT = ISNULL((
      SELECT MAX(TRY_CONVERT(INT, SUBSTRING(patient_code, 3, 20)))
      FROM Patients
      WHERE patient_code LIKE 'BN%'
    ), 240000) + 1;

    DECLARE @patientCode VARCHAR(30) = CONCAT('BN', @nextPatientNumber);

    INSERT INTO Patients (
      patient_code,
      full_name,
      date_of_birth,
      gender,
      identity_number,
      phone,
      address,
      health_insurance_no,
      emergency_contact_name,
      emergency_contact_phone
    )
    VALUES (
      @patientCode,
      @fullName,
      @dateOfBirth,
      @gender,
      NULLIF(@identityNumber, ''),
      NULLIF(@phone, ''),
      N'Chưa cập nhật',
      NULL,
      NULL,
      NULL
    );

    DECLARE @patientId INT = SCOPE_IDENTITY();

    INSERT INTO Users (
      role_id,
      username,
      email,
      password_hash,
      full_name,
      patient_id,
      status
    )
    VALUES (
      @roleId,
      @username,
      @email,
      @passwordHash,
      @fullName,
      @patientId,
      N'Hoạt động'
    );

    COMMIT TRANSACTION;
  `, data);
}

async function updatePassword(login, passwordHash) {
  return execute(`
    UPDATE Users
    SET password_hash = @passwordHash,
        updated_at = SYSDATETIME()
    WHERE username = @login OR email = @login
  `, { login, passwordHash });
}

module.exports = {
  findUserByLogin,
  createPatientAccount,
  updatePassword
};
