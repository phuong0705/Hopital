const { query, execute } = require('./base.repository');

async function ensureBackupJobsTable() {
  await execute(`
    IF OBJECT_ID(N'BackupJobs', N'U') IS NULL
    BEGIN
      CREATE TABLE BackupJobs (
        backup_id INT IDENTITY(1,1) PRIMARY KEY,
        backup_code VARCHAR(40) NOT NULL UNIQUE,
        backup_name NVARCHAR(180) NOT NULL,
        backup_scope NVARCHAR(80) NOT NULL,
        status NVARCHAR(50) NOT NULL,
        requested_by INT NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        completed_at DATETIME2 NULL,
        note NVARCHAR(500),
        CONSTRAINT FK_BackupJobs_User FOREIGN KEY (requested_by) REFERENCES Users(user_id)
      );
    END;
  `);
}

async function createBackupJob(data, requestedBy) {
  await ensureBackupJobsTable();

  const rows = await query(`
    DECLARE @nextNumber INT;
    SELECT @nextNumber = ISNULL(MAX(TRY_CONVERT(INT, SUBSTRING(backup_code, 3, 20))), 0) + 1
    FROM BackupJobs;

    DECLARE @backupCode VARCHAR(40) = CONCAT('BK', RIGHT(CONCAT('000000', @nextNumber), 6));
    DECLARE @backupName NVARCHAR(180) = CONCAT(N'backup_', FORMAT(SYSDATETIME(), 'yyyyMMdd_HHmmss'), N'.bak');

    INSERT INTO BackupJobs (backup_code, backup_name, backup_scope, status, requested_by, completed_at, note)
    OUTPUT INSERTED.backup_id AS backupId, INSERTED.backup_code AS backupCode, INSERTED.backup_name AS backupName
    VALUES (@backupCode, @backupName, @backupScope, N'Đã ghi nhận', @requestedBy, SYSDATETIME(), NULLIF(@note, ''));
  `, {
    backupScope: data.backupScope || 'Dữ liệu nghiệp vụ',
    requestedBy: requestedBy || null,
    note: data.note || ''
  });

  return rows[0];
}

async function getBackupJobs() {
  await ensureBackupJobsTable();

  return query(`
    SELECT TOP 20
      bj.backup_id AS backupId,
      bj.backup_code AS backupCode,
      bj.backup_name AS backupName,
      bj.backup_scope AS backupScope,
      bj.status,
      bj.created_at AS createdAt,
      bj.completed_at AS completedAt,
      bj.note,
      u.full_name AS requestedBy
    FROM BackupJobs bj
    LEFT JOIN Users u ON u.user_id = bj.requested_by
    ORDER BY bj.created_at DESC
  `);
}

module.exports = {
  createBackupJob,
  getBackupJobs
};
