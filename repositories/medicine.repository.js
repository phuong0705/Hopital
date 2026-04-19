const { query, execute } = require('./base.repository');

async function ensureMedicineCatalog() {
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
    IF NOT EXISTS (SELECT 1 FROM MedicineCatalog)
    BEGIN
      INSERT INTO MedicineCatalog (
        medicine_code, medicine_name, active_ingredient, medicine_group,
        dosage_form, strength, route, unit, unit_price, stock_warning_level,
        usage_note, contraindications, status
      )
      VALUES
      ('TH001', N'Ceftriaxone 1g', N'Ceftriaxone', N'Kháng sinh', N'Lọ bột pha tiêm', N'1g', N'Tĩnh mạch', N'lọ', 45000, 30, N'Dùng theo kháng sinh đồ hoặc phác đồ nhiễm khuẩn nặng.', N'Thận trọng tiền sử dị ứng beta-lactam.', N'Đang sử dụng'),
      ('TH002', N'Paracetamol 500mg', N'Paracetamol', N'Giảm đau - hạ sốt', N'Viên nén', N'500mg', N'Uống', N'viên', 800, 100, N'Dùng khi sốt hoặc đau mức độ nhẹ đến vừa.', N'Thận trọng bệnh gan, nghiện rượu, quá liều.', N'Đang sử dụng'),
      ('TH003', N'Insulin regular', N'Insulin regular', N'Nội tiết', N'Lọ tiêm', N'100IU/ml', N'Tiêm dưới da/Tĩnh mạch', N'lọ', 185000, 10, N'Kiểm soát đường huyết nội trú, cần theo dõi glucose mao mạch.', N'Nguy cơ hạ đường huyết, cần dùng đúng y lệnh.', N'Đang sử dụng'),
      ('TH004', N'Amlodipine 5mg', N'Amlodipine', N'Tim mạch', N'Viên nén', N'5mg', N'Uống', N'viên', 1200, 60, N'Điều trị tăng huyết áp, theo dõi phù ngoại biên và huyết áp.', N'Thận trọng hạ huyết áp, suy gan.', N'Đang sử dụng'),
      ('TH005', N'Omeprazole 20mg', N'Omeprazole', N'Tiêu hóa', N'Viên nang', N'20mg', N'Uống', N'viên', 1800, 50, N'Giảm tiết acid, dự phòng loét stress khi có chỉ định.', N'Thận trọng dùng kéo dài, tương tác thuốc.', N'Đang sử dụng');
    END;
  `);
}

async function getMedicines() {
  await ensureMedicineCatalog();

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
      usage_note AS usageNote,
      contraindications,
      status
    FROM MedicineCatalog
    ORDER BY medicine_name
  `);
}

async function createMedicine(data) {
  await ensureMedicineCatalog();

  await execute(`
    INSERT INTO MedicineCatalog (
      medicine_code, medicine_name, active_ingredient, medicine_group,
      dosage_form, strength, route, unit, unit_price, stock_warning_level,
      usage_note, contraindications, status
    )
    VALUES (
      @medicineCode, @medicineName, NULLIF(@activeIngredient, ''), @medicineGroup,
      @dosageForm, NULLIF(@strength, ''), NULLIF(@route, ''), @unit,
      @unitPrice, @stockWarningLevel, NULLIF(@usageNote, ''),
      NULLIF(@contraindications, ''), @status
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
    usageNote: data.usageNote || '',
    contraindications: data.contraindications || '',
    status: data.status || 'Đang sử dụng'
  });
}

async function updateMedicineStatus(medicineId, status) {
  await ensureMedicineCatalog();

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
  createMedicine,
  updateMedicineStatus
};
