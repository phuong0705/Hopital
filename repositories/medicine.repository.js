const { query, execute } = require('./base.repository');

async function ensureMedicineTables() {
  await execute(`
    IF OBJECT_ID(N'MedicineCatalog', N'U') IS NULL
    BEGIN
      CREATE TABLE MedicineCatalog (
        medicine_id INT IDENTITY(1,1) PRIMARY KEY,
        medicine_code VARCHAR(30) NOT NULL UNIQUE,
        medicine_name NVARCHAR(180) NOT NULL,
        active_ingredient NVARCHAR(180),
        medicine_group NVARCHAR(150) NOT NULL,
        dosage_form NVARCHAR(100) NOT NULL,
        strength NVARCHAR(80),
        route NVARCHAR(80),
        unit NVARCHAR(50) NOT NULL DEFAULT N'viên',
        unit_price DECIMAL(18,2) NOT NULL DEFAULT 0,
        stock_warning_level INT NOT NULL DEFAULT 20,
        usage_note NVARCHAR(1000),
        contraindications NVARCHAR(1000),
        status NVARCHAR(30) NOT NULL DEFAULT N'Đang sử dụng',
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at DATETIME2
      );
    END;
  `);

  const columns = [
    ['active_ingredient', 'NVARCHAR(180)'],
    ['medicine_group', "NVARCHAR(150) NOT NULL DEFAULT N'Khác'"],
    ['dosage_form', "NVARCHAR(100) NOT NULL DEFAULT N'Viên'"],
    ['strength', 'NVARCHAR(80)'],
    ['route', 'NVARCHAR(80)'],
    ['unit', "NVARCHAR(50) NOT NULL DEFAULT N'viên'"],
    ['unit_price', 'DECIMAL(18,2) NOT NULL DEFAULT 0'],
    ['stock_warning_level', 'INT NOT NULL DEFAULT 20'],
    ['usage_note', 'NVARCHAR(1000)'],
    ['contraindications', 'NVARCHAR(1000)'],
    ['current_stock', 'INT NOT NULL DEFAULT 0'],
    ['updated_at', 'DATETIME2']
  ];

  for (const [name, type] of columns) {
    await execute(`
      IF COL_LENGTH('MedicineCatalog', '${name}') IS NULL
      BEGIN
        ALTER TABLE MedicineCatalog ADD ${name} ${type};
      END;
    `);
  }

  await execute(`
    IF OBJECT_ID(N'MedicineInventoryHistory', N'U') IS NULL
    BEGIN
      CREATE TABLE MedicineInventoryHistory (
        history_id INT IDENTITY(1,1) PRIMARY KEY,
        medicine_id INT NOT NULL,
        transaction_type NVARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        transaction_date DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        performed_by INT NULL,
        note NVARCHAR(500),
        CONSTRAINT FK_Inventory_Medicine FOREIGN KEY (medicine_id) REFERENCES MedicineCatalog(medicine_id),
        CONSTRAINT FK_Inventory_User FOREIGN KEY (performed_by) REFERENCES Users(user_id)
      );
    END;
  `);

  const historyColumns = [
    ['receipt_code', 'VARCHAR(30) NULL'],
    ['warehouse_name', 'NVARCHAR(150) NULL']
  ];

  for (const [name, type] of historyColumns) {
    await execute(`
      IF COL_LENGTH('MedicineInventoryHistory', '${name}') IS NULL
      BEGIN
        ALTER TABLE MedicineInventoryHistory ADD ${name} ${type};
      END;
    `);
  }

  await execute(`
    IF OBJECT_ID(N'MedicineProvisionRequests', N'U') IS NULL
    BEGIN
      CREATE TABLE MedicineProvisionRequests (
        request_id INT IDENTITY(1,1) PRIMARY KEY,
        request_code VARCHAR(30) NOT NULL UNIQUE,
        department_name NVARCHAR(150),
        note NVARCHAR(500),
        status NVARCHAR(50) NOT NULL DEFAULT N'Đã gửi yêu cầu',
        created_by INT NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_MedicineProvisionRequests_User FOREIGN KEY (created_by) REFERENCES Users(user_id)
      );
    END;
  `);

  await execute(`
    IF NOT EXISTS (SELECT 1 FROM MedicineCatalog)
    BEGIN
      INSERT INTO MedicineCatalog (
        medicine_code, medicine_name, active_ingredient, medicine_group,
        dosage_form, strength, route, unit, unit_price, stock_warning_level,
        usage_note, contraindications, status, current_stock
      )
      VALUES
      ('TH001', N'Ceftriaxone 1g', N'Ceftriaxone', N'Kháng sinh', N'Lọ bột pha tiêm', N'1g', N'Tĩnh mạch', N'lọ', 45000, 30, N'Dùng theo kháng sinh đồ hoặc phác đồ nhiễm khuẩn nặng.', N'Thận trọng tiền sử dị ứng beta-lactam.', N'Đang sử dụng', 90),
      ('TH002', N'Paracetamol 500mg', N'Paracetamol', N'Giảm đau - hạ sốt', N'Viên nén', N'500mg', N'Uống', N'viên', 800, 100, N'Dùng khi sốt hoặc đau mức độ nhẹ đến vừa.', N'Thận trọng bệnh gan, nghiện rượu, quá liều.', N'Đang sử dụng', 500),
      ('TH003', N'Insulin regular', N'Insulin regular', N'Nội tiết', N'Lọ tiêm', N'100IU/ml', N'Tiêm dưới da/Tĩnh mạch', N'lọ', 185000, 10, N'Kiểm soát đường huyết nội trú, cần theo dõi glucose mao mạch.', N'Nguy cơ hạ đường huyết, cần dùng đúng y lệnh.', N'Đang sử dụng', 50),
      ('TH004', N'Amlodipine 5mg', N'Amlodipine', N'Tim mạch', N'Viên nén', N'5mg', N'Uống', N'viên', 1200, 60, N'Điều trị tăng huyết áp, theo dõi phù ngoại biên và huyết áp.', N'Thận trọng hạ huyết áp, suy gan.', N'Đang sử dụng', 100),
      ('TH005', N'Omeprazole 20mg', N'Omeprazole', N'Tiêu hóa', N'Viên nang', N'20mg', N'Uống', N'viên', 1800, 50, N'Giảm tiết acid, dự phòng loét stress khi có chỉ định.', N'Thận trọng dùng kéo dài, tương tác thuốc.', N'Đang sử dụng', 120);

      DECLARE @Med1 INT, @Med2 INT, @Med3 INT, @UserAdmin INT;
      SELECT @Med1 = medicine_id FROM MedicineCatalog WHERE medicine_code = 'TH001';
      SELECT @Med2 = medicine_id FROM MedicineCatalog WHERE medicine_code = 'TH002';
      SELECT @Med3 = medicine_id FROM MedicineCatalog WHERE medicine_code = 'TH003';
      SELECT TOP 1 @UserAdmin = user_id FROM Users WHERE username = 'admin';

      INSERT INTO MedicineInventoryHistory (medicine_id, transaction_type, quantity, transaction_date, performed_by, note)
      VALUES
      (@Med1, N'Nhập kho', 100, DATEADD(day, -5, SYSDATETIME()), @UserAdmin, N'Nhập kho định kỳ đầu tháng'),
      (@Med1, N'Xuất kho', 10, DATEADD(day, -3, SYSDATETIME()), @UserAdmin, N'Xuất cho khoa Nội'),
      (@Med2, N'Nhập kho', 500, DATEADD(day, -4, SYSDATETIME()), @UserAdmin, N'Nhập bổ sung'),
      (@Med3, N'Nhập kho', 50, DATEADD(day, -2, SYSDATETIME()), @UserAdmin, N'Nhập thuốc hiếm');
    END;
  `);
}

async function getMedicines() {
  await ensureMedicineTables();

  return query(`
    SELECT
      medicine_id AS medicineId,
      medicine_code AS medicineCode,
      medicine_name AS medicineName,
      active_ingredient AS activeIngredient,
      medicine_group AS medicineGroup,
      dosage_form AS dosageForm,
      strength,
      route,
      unit,
      unit_price AS unitPrice,
      stock_warning_level AS stockWarningLevel,
      current_stock AS currentStock,
      usage_note AS usageNote,
      contraindications,
      status
    FROM MedicineCatalog
    ORDER BY medicine_name
  `);
}

async function searchMedicines(keyword = '') {
  await ensureMedicineTables();

  const searchText = String(keyword || '').trim();
  if (searchText.length < 2) return [];

  return query(`
    SELECT TOP 10
      medicine_id AS medicineId,
      medicine_code AS medicineCode,
      medicine_name AS medicineName,
      active_ingredient AS activeIngredient,
      dosage_form AS dosageForm,
      strength,
      route,
      unit,
      current_stock AS currentStock
    FROM MedicineCatalog
    WHERE status = N'Đang sử dụng'
      AND (
        medicine_name LIKE @keyword
        OR medicine_code LIKE @keyword
        OR active_ingredient LIKE @keyword
      )
    ORDER BY
      CASE WHEN medicine_name LIKE @prefix THEN 0 ELSE 1 END,
      medicine_name
  `, {
    keyword: `%${searchText}%`,
    prefix: `${searchText}%`
  });
}

async function getMedicineHistory(medicineId) {
  await ensureMedicineTables();

  return query(`
    SELECT
      h.history_id AS historyId,
      h.receipt_code AS receiptCode,
      m.medicine_name AS itemName,
      m.unit,
      h.transaction_type AS transactionType,
      h.quantity,
      h.transaction_date AS transactionDate,
      h.warehouse_name AS warehouseName,
      h.note,
      u.full_name AS performedBy
    FROM MedicineInventoryHistory h
    INNER JOIN MedicineCatalog m ON m.medicine_id = h.medicine_id
    LEFT JOIN Users u ON h.performed_by = u.user_id
    WHERE h.medicine_id = @medicineId
    ORDER BY h.transaction_date DESC
  `, { medicineId });
}

async function addInventoryTransaction(data) {
  await ensureMedicineTables();

  const { medicineId, transactionType, performedBy, note } = data;
  const quantity = Number(data.quantity || 0);
  const warehouseName = data.warehouseName || 'Kho Dược';

  if (!medicineId || !Number.isInteger(Number(medicineId))) {
    throw new Error('Vui lòng chọn thuốc/vật tư.');
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('Vui lòng nhập số lượng hợp lệ.');
  }

  if (!warehouseName.trim()) {
    throw new Error('Vui lòng nhập kho nhận.');
  }

  const rows = await query(`
    DECLARE @nextNumber INT;
    SELECT @nextNumber = ISNULL(MAX(TRY_CONVERT(INT, SUBSTRING(receipt_code, 4, 20))), 0) + 1
    FROM MedicineInventoryHistory
    WHERE receipt_code LIKE 'PNK%';

    SELECT CONCAT('PNK', RIGHT(CONCAT('000000', @nextNumber), 6)) AS receiptCode;
  `);
  const receiptCode = rows[0]?.receiptCode || `PNK${Date.now()}`;

  await execute(`
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;
    
    INSERT INTO MedicineInventoryHistory (
      medicine_id, receipt_code, transaction_type, quantity, transaction_date, performed_by, warehouse_name, note
    )
    VALUES (
      @medicineId, @receiptCode, @transactionType, @quantity, SYSDATETIME(), @performedBy, NULLIF(@warehouseName, ''), NULLIF(@note, '')
    );

    UPDATE MedicineCatalog
    SET current_stock = CASE
          WHEN @transactionType IN (N'Nhập kho', N'Hoàn trả') THEN current_stock + @quantity
          WHEN current_stock >= @quantity THEN current_stock - @quantity
          ELSE 0
        END,
        updated_at = SYSDATETIME()
    WHERE medicine_id = @medicineId;

    COMMIT TRANSACTION;
  `, {
    medicineId,
    receiptCode,
    transactionType,
    quantity,
    performedBy,
    warehouseName,
    note: note || ''
  });

  return { receiptCode };
}

async function createProvisionRequest(data) {
  await ensureMedicineTables();

  const rows = await query(`
    DECLARE @nextNumber INT;
    SELECT @nextNumber = ISNULL(MAX(TRY_CONVERT(INT, SUBSTRING(request_code, 3, 20))), 0) + 1
    FROM MedicineProvisionRequests;

    DECLARE @requestCode VARCHAR(30) = CONCAT('DT', RIGHT(CONCAT('000000', @nextNumber), 6));

    INSERT INTO MedicineProvisionRequests (request_code, department_name, note, status, created_by)
    OUTPUT INSERTED.request_id AS requestId, INSERTED.request_code AS requestCode
    VALUES (@requestCode, NULLIF(@departmentName, ''), NULLIF(@note, ''), N'Đã gửi yêu cầu', @createdBy);
  `, {
    departmentName: data.departmentName || '',
    note: data.note || '',
    createdBy: data.createdBy || null
  });

  return rows[0];
}

async function createMedicine(data) {
  await ensureMedicineTables();

  await execute(`
    INSERT INTO MedicineCatalog (
      medicine_code, medicine_name, active_ingredient, medicine_group,
      dosage_form, strength, route, unit, unit_price, stock_warning_level,
      usage_note, contraindications, status, current_stock
    )
    VALUES (
      @medicineCode, @medicineName, NULLIF(@activeIngredient, ''), @medicineGroup,
      @dosageForm, NULLIF(@strength, ''), NULLIF(@route, ''), @unit,
      @unitPrice, @stockWarningLevel, NULLIF(@usageNote, ''),
      NULLIF(@contraindications, ''), @status, @currentStock
    )
  `, {
    medicineCode: data.medicineCode,
    medicineName: data.medicineName,
    activeIngredient: data.activeIngredient || '',
    medicineGroup: data.medicineGroup,
    dosageForm: data.dosageForm,
    strength: data.strength || '',
    route: data.route || '',
    unit: data.unit || 'viên',
    unitPrice: Number(data.unitPrice || 0),
    stockWarningLevel: Number(data.stockWarningLevel || 20),
    currentStock: Number(data.currentStock || 0),
    usageNote: data.usageNote || '',
    contraindications: data.contraindications || '',
    status: data.status || 'Đang sử dụng'
  });
}

async function updateMedicine(medicineId, data) {
  await ensureMedicineTables();

  await execute(`
    UPDATE MedicineCatalog
    SET medicine_code = @medicineCode,
      medicine_name = @medicineName,
      active_ingredient = NULLIF(@activeIngredient, ''),
      medicine_group = @medicineGroup,
      dosage_form = @dosageForm,
      strength = NULLIF(@strength, ''),
      route = NULLIF(@route, ''),
      unit = @unit,
      unit_price = @unitPrice,
      stock_warning_level = @stockWarningLevel,
      usage_note = NULLIF(@usageNote, ''),
      contraindications = NULLIF(@contraindications, ''),
      status = @status,
      updated_at = SYSDATETIME()
    WHERE medicine_id = @medicineId
  `, {
    medicineId: Number(medicineId),
    medicineCode: data.medicineCode,
    medicineName: data.medicineName,
    activeIngredient: data.activeIngredient || '',
    medicineGroup: data.medicineGroup,
    dosageForm: data.dosageForm,
    strength: data.strength || '',
    route: data.route || '',
    unit: data.unit || 'viên',
    unitPrice: Number(data.unitPrice || 0),
    stockWarningLevel: Number(data.stockWarningLevel || 20),
    usageNote: data.usageNote || '',
    contraindications: data.contraindications || '',
    status: data.status || 'Đang sử dụng'
  });
}

async function updateMedicineStatus(medicineId, status) {
  await ensureMedicineTables();

  await execute(`
    UPDATE MedicineCatalog
    SET status = @status,
        updated_at = SYSDATETIME()
    WHERE medicine_id = @medicineId
  `, {
    medicineId: Number(medicineId),
    status
  });
}

module.exports = {
  getMedicines,
  searchMedicines,
  createMedicine,
  updateMedicine,
  updateMedicineStatus,
  getMedicineHistory,
  addInventoryTransaction,
  createProvisionRequest
};
