USE QuanLyKhamChuaBenhNoiTru;
GO

IF OBJECT_ID(N'dbo.FormTemplates', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.FormTemplates (
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
GO

MERGE dbo.FormTemplates AS target
USING (
  SELECT
    'BM-NT-15' AS template_code,
    N'Đơn thuốc nội trú' AS template_name,
    N'Điều trị nội trú' AS template_type,
    N'Biểu mẫu kê đơn thuốc nội trú gồm thông tin người bệnh, khoa/buồng/giường, chẩn đoán, dị ứng thuốc, danh mục thuốc và phần xác nhận.' AS description,
    N'/nghiep-vu/bieu-mau/don-thuoc-noi-tru' AS file_url
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
GO
