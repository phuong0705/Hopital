const { query, execute } = require('./base.repository');

async function ensureSupplyTables() {
  await execute(`
    IF OBJECT_ID(N'SupplyCatalog', N'U') IS NULL
    BEGIN
      CREATE TABLE SupplyCatalog (
        supply_id INT IDENTITY(1,1) PRIMARY KEY,
        supply_code VARCHAR(30) NOT NULL UNIQUE,
        supply_name NVARCHAR(180) NOT NULL,
        unit NVARCHAR(50) NOT NULL,
        current_stock INT NOT NULL DEFAULT 0,
        stock_norm INT NOT NULL DEFAULT 0,
        status NVARCHAR(50) NOT NULL DEFAULT N'Đang sử dụng',
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at DATETIME2
      );
    END;

    IF OBJECT_ID(N'SupplyTransactions', N'U') IS NULL
    BEGIN
      CREATE TABLE SupplyTransactions (
        transaction_id INT IDENTITY(1,1) PRIMARY KEY,
        supply_id INT NOT NULL,
        transaction_type NVARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        note NVARCHAR(500),
        created_by INT NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        receipt_code VARCHAR(30) NULL,
        warehouse_name NVARCHAR(150) NULL,
        CONSTRAINT FK_SupplyTransactions_Supply FOREIGN KEY (supply_id) REFERENCES SupplyCatalog(supply_id),
        CONSTRAINT FK_SupplyTransactions_User FOREIGN KEY (created_by) REFERENCES Users(user_id)
      );
    END;
  `);

  const transactionColumns = [
    ['receipt_code', 'VARCHAR(30) NULL'],
    ['warehouse_name', 'NVARCHAR(150) NULL']
  ];

  for (const [name, type] of transactionColumns) {
    await execute(`
      IF COL_LENGTH('SupplyTransactions', '${name}') IS NULL
      BEGIN
        ALTER TABLE SupplyTransactions ADD ${name} ${type};
      END;
    `);
  }

  await execute(`
    IF NOT EXISTS (SELECT 1 FROM SupplyCatalog)
    BEGIN
      INSERT INTO SupplyCatalog (supply_code, supply_name, unit, current_stock, stock_norm, status)
      VALUES
        ('VT001', N'Bơm kim tiêm 5ml', N'Cái', 450, 500, N'Đang sử dụng'),
        ('VT002', N'Găng tay y tế Size M', N'Đôi', 12, 100, N'Đang sử dụng'),
        ('VT003', N'Bông hút nước', N'Gói', 25, 30, N'Đang sử dụng'),
        ('VT004', N'Cồn 70 độ', N'Chai', 80, 100, N'Đang sử dụng');
    END;
  `);
}

async function getSupplies() {
  await ensureSupplyTables();

  return query(`
    SELECT
      supply_id AS supplyId,
      supply_code AS supplyCode,
      supply_name AS supplyName,
      unit,
      current_stock AS currentStock,
      stock_norm AS stockNorm,
      CASE
        WHEN current_stock <= 0 THEN N'Hết hàng'
        WHEN stock_norm > 0 AND current_stock < stock_norm * 0.3 THEN N'Sắp hết'
        WHEN stock_norm > 0 AND current_stock < stock_norm THEN N'Dưới định mức'
        ELSE N'Ổn định'
      END AS warningStatus,
      status
    FROM SupplyCatalog
    ORDER BY supply_name
  `);
}

async function addSupplyTransaction(data, createdBy) {
  await ensureSupplyTables();

  const quantity = Number(data.quantity || 0);
  const transactionType = data.transactionType || 'Yêu cầu lĩnh';
  const warehouseName = data.warehouseName || 'Kho Dược';

  if (!data.supplyId || !Number.isInteger(Number(data.supplyId))) {
    throw new Error('Vui lòng chọn vật tư.');
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('Vui lòng nhập số lượng hợp lệ.');
  }

  const receiptRows = await query(`
    DECLARE @nextNumber INT;
    SELECT @nextNumber = ISNULL(MAX(TRY_CONVERT(INT, SUBSTRING(receipt_code, 4, 20))), 0) + 1
    FROM SupplyTransactions
    WHERE receipt_code LIKE 'PNV%';

    SELECT CONCAT('PNV', RIGHT(CONCAT('000000', @nextNumber), 6)) AS receiptCode;
  `);
  const receiptCode = receiptRows[0]?.receiptCode || `PNV${Date.now()}`;

  await execute(`
    BEGIN TRANSACTION;

    INSERT INTO SupplyTransactions (supply_id, receipt_code, transaction_type, quantity, note, created_by, warehouse_name)
    VALUES (@supplyId, @receiptCode, @transactionType, @quantity, NULLIF(@note, ''), @createdBy, NULLIF(@warehouseName, ''));

    IF @transactionType IN (N'Xuất sử dụng', N'Cấp phát')
    BEGIN
      UPDATE SupplyCatalog
      SET current_stock = CASE WHEN current_stock >= @quantity THEN current_stock - @quantity ELSE 0 END,
          updated_at = SYSDATETIME()
      WHERE supply_id = @supplyId;
    END;

    IF @transactionType IN (N'Nhập kho', N'Hoàn trả')
    BEGIN
      UPDATE SupplyCatalog
      SET current_stock = current_stock + @quantity,
          updated_at = SYSDATETIME()
      WHERE supply_id = @supplyId;
    END;

    COMMIT TRANSACTION;
  `, {
    supplyId: Number(data.supplyId),
    receiptCode,
    transactionType,
    quantity,
    note: data.note || '',
    createdBy: createdBy || null,
    warehouseName
  });

  return { receiptCode };
}

async function getSupplyHistory(supplyId) {
  await ensureSupplyTables();

  return query(`
    SELECT
      st.transaction_id AS transactionId,
      st.receipt_code AS receiptCode,
      sc.supply_name AS itemName,
      sc.unit,
      st.transaction_type AS transactionType,
      st.quantity,
      st.created_at AS transactionDate,
      st.warehouse_name AS warehouseName,
      st.note,
      u.full_name AS performedBy
    FROM SupplyTransactions st
    INNER JOIN SupplyCatalog sc ON sc.supply_id = st.supply_id
    LEFT JOIN Users u ON u.user_id = st.created_by
    WHERE st.supply_id = @supplyId
    ORDER BY st.created_at DESC
  `, { supplyId: Number(supplyId) });
}

module.exports = {
  getSupplies,
  addSupplyTransaction,
  getSupplyHistory
};
