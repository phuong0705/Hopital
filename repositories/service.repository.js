const { query, execute } = require('./base.repository');

async function ensureServiceCatalog() {
  await execute(`
    IF OBJECT_ID(N'ServiceCatalog', N'U') IS NULL
    BEGIN
      CREATE TABLE ServiceCatalog (
        service_id INT IDENTITY(1,1) PRIMARY KEY,
        service_code VARCHAR(30) NOT NULL UNIQUE,
        service_name NVARCHAR(180) NOT NULL,
        service_group NVARCHAR(150) NOT NULL,
        department_name NVARCHAR(150),
        unit NVARCHAR(50) NOT NULL DEFAULT N'lần',
        unit_price DECIMAL(18,2) NOT NULL DEFAULT 0,
        insurance_rate INT NOT NULL DEFAULT 0,
        turnaround_time NVARCHAR(100),
        description NVARCHAR(1000),
        status NVARCHAR(30) NOT NULL DEFAULT N'Đang sử dụng',
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at DATETIME2
      );
    END;
  `);

  const columns = [
    ['service_group', "NVARCHAR(150) NOT NULL DEFAULT N'Khác'"],
    ['department_name', 'NVARCHAR(150)'],
    ['unit', "NVARCHAR(50) NOT NULL DEFAULT N'lần'"],
    ['unit_price', 'DECIMAL(18,2) NOT NULL DEFAULT 0'],
    ['insurance_rate', 'INT NOT NULL DEFAULT 0'],
    ['turnaround_time', 'NVARCHAR(100)'],
    ['description', 'NVARCHAR(1000)'],
    ['updated_at', 'DATETIME2']
  ];

  for (const [name, type] of columns) {
    await execute(`
      IF COL_LENGTH('ServiceCatalog', '${name}') IS NULL
      BEGIN
        ALTER TABLE ServiceCatalog ADD ${name} ${type};
      END;
    `);
  }

  await execute(`
    IF NOT EXISTS (SELECT 1 FROM ServiceCatalog)
    BEGIN
      INSERT INTO ServiceCatalog (
        service_code, service_name, service_group, department_name, unit,
        unit_price, insurance_rate, turnaround_time, description, status
      )
      VALUES
      ('DV001', N'Khám chuyên khoa nội trú', N'Khám bệnh', N'Nội tổng hợp', N'lần', 300000, 80, N'Trong ngày', N'Khám đánh giá bệnh nhân nội trú theo chuyên khoa.', N'Đang sử dụng'),
      ('DV002', N'Ngày giường nội trú thường', N'Giường bệnh', N'Khoa nội trú', N'ngày', 300000, 70, N'24 giờ', N'Tính theo số ngày nằm điều trị nội trú.', N'Đang sử dụng'),
      ('DV003', N'Ngày giường hồi sức cấp cứu', N'Giường bệnh', N'Hồi sức cấp cứu', N'ngày', 750000, 70, N'24 giờ', N'Giường theo dõi sát, oxy, monitor theo chỉ định.', N'Đang sử dụng'),
      ('DV004', N'Công thức máu', N'Xét nghiệm', N'Xét nghiệm', N'lần', 120000, 80, N'2-4 giờ', N'Xét nghiệm huyết học cơ bản phục vụ theo dõi điều trị.', N'Đang sử dụng'),
      ('DV005', N'X-quang phổi thẳng', N'Chẩn đoán hình ảnh', N'Chẩn đoán hình ảnh', N'lần', 180000, 80, N'Trong ngày', N'Chụp X-quang phổi phục vụ chẩn đoán bệnh hô hấp.', N'Đang sử dụng');
    END;
  `);
}

async function getServices() {
  await ensureServiceCatalog();

  return query(`
    SELECT
      service_id AS serviceId,
      service_code AS serviceCode,
      service_name AS serviceName,
      service_group AS serviceGroup,
      department_name AS departmentName,
      unit,
      unit_price AS unitPrice,
      insurance_rate AS insuranceRate,
      turnaround_time AS turnaroundTime,
      description,
      status
    FROM ServiceCatalog
    ORDER BY service_group, service_name
  `);
}

async function getClinicalOrderServices() {
  await ensureServiceCatalog();

  return query(`
    SELECT
      service_id AS serviceId,
      service_code AS serviceCode,
      service_name AS serviceName,
      service_group AS serviceGroup,
      department_name AS departmentName,
      unit_price AS unitPrice
    FROM ServiceCatalog
    WHERE status = N'Đang sử dụng'
      AND service_group IN (N'Xét nghiệm', N'Chẩn đoán hình ảnh')
    ORDER BY service_group, service_name
  `);
}

async function createService(data) {
  await ensureServiceCatalog();

  await execute(`
    INSERT INTO ServiceCatalog (
      service_code, service_name, service_group, department_name, unit,
      unit_price, insurance_rate, turnaround_time, description, status
    )
    VALUES (
      @serviceCode, @serviceName, @serviceGroup, NULLIF(@departmentName, ''),
      @unit, @unitPrice, @insuranceRate, NULLIF(@turnaroundTime, ''),
      NULLIF(@description, ''), @status
    )
  `, {
    serviceCode: data.serviceCode,
    serviceName: data.serviceName,
    serviceGroup: data.serviceGroup,
    departmentName: data.departmentName || '',
    unit: data.unit || 'lần',
    unitPrice: Number(data.unitPrice || 0),
    insuranceRate: Number(data.insuranceRate || 0),
    turnaroundTime: data.turnaroundTime || '',
    description: data.description || '',
    status: data.status || 'Đang sử dụng'
  });
}

async function updateServiceStatus(serviceId, status) {
  await ensureServiceCatalog();

  await execute(`
    UPDATE ServiceCatalog
    SET status = @status,
        updated_at = SYSDATETIME()
    WHERE service_id = @serviceId
  `, {
    serviceId: Number(serviceId),
    status
  });
}

module.exports = {
  getServices,
  getClinicalOrderServices,
  createService,
  updateServiceStatus
};
