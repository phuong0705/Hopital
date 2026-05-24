const { query, execute } = require('./base.repository');

const defaultTemplates = [
  {
    code: 'BM-TNNB-01',
    name: 'Phiếu tiếp nhận bệnh nhân nội trú',
    type: 'Tiếp nhận nội trú',
    description: 'Biểu mẫu ghi nhận thông tin người bệnh, người liên hệ, lý do vào viện, sinh hiệu ban đầu và hướng xử trí khi tiếp nhận điều trị nội trú.',
    fileUrl: '/form-templates/bm-tnnb-01-phieu-tiep-nhan-benh-nhan-noi-tru.pdf'
  },
  {
    code: 'BM-NT-04',
    name: 'Phiếu phân khoa, buồng, giường',
    type: 'Điều phối giường',
    description: 'Biểu mẫu điều phối khoa điều trị, buồng, giường, loại giường và bàn giao người bệnh vào khoa nội trú.',
    fileUrl: '/form-templates/bm-nt-04-phieu-phan-khoa-buong-giuong.pdf'
  },
  {
    code: 'BM-NT-05',
    name: 'Hồ sơ bệnh án nội trú',
    type: 'Hồ sơ bệnh án',
    description: 'Biểu mẫu tổng hợp hành chính, thông tin bệnh án, hướng điều trị và xác nhận hồ sơ bệnh án nội trú.',
    fileUrl: '/form-templates/bm-nt-05-ho-so-benh-an-noi-tru.pdf'
  }
];

async function ensureFormTemplateTables() {
  await execute(`
    IF OBJECT_ID(N'FormTemplates', N'U') IS NULL
    BEGIN
      CREATE TABLE FormTemplates (
        template_id INT IDENTITY(1,1) PRIMARY KEY,
        template_code VARCHAR(40) NOT NULL UNIQUE,
        template_name NVARCHAR(180) NOT NULL,
        template_type NVARCHAR(100) NOT NULL,
        description NVARCHAR(500),
        file_url NVARCHAR(500),
        status NVARCHAR(50) NOT NULL DEFAULT N'Đang sử dụng',
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at DATETIME2
      );
    END;
  `);

  await seedDefaultFormTemplates();
}

async function seedDefaultFormTemplates() {
  for (const template of defaultTemplates) {
    await execute(`
      MERGE FormTemplates AS target
      USING (
        SELECT
          @code AS template_code,
          @name AS template_name,
          @type AS template_type,
          @description AS description,
          @fileUrl AS file_url
      ) AS source
      ON target.template_code = source.template_code
      WHEN MATCHED THEN
        UPDATE SET
          template_name = source.template_name,
          template_type = source.template_type,
          description = source.description,
          file_url = source.file_url,
          status = N'Đang sử dụng',
          updated_at = SYSDATETIME()
      WHEN NOT MATCHED THEN
        INSERT (template_code, template_name, template_type, description, file_url, status)
        VALUES (source.template_code, source.template_name, source.template_type, source.description, source.file_url, N'Đang sử dụng');
    `, template);
  }
}

async function getFormTemplates() {
  await ensureFormTemplateTables();

  return query(`
    SELECT
      template_id AS templateId,
      template_code AS templateCode,
      template_name AS templateName,
      template_type AS templateType,
      description,
      file_url AS fileUrl,
      status,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM FormTemplates
    ORDER BY template_type, template_name
  `);
}

module.exports = {
  getFormTemplates
};
