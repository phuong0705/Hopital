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
        CONSTRAINT FK_SupplyTransactions_Supply FOREIGN KEY (supply_id) REFERENCES SupplyCatalog(supply_id),
        CONSTRAINT FK_SupplyTransactions_User FOREIGN KEY (created_by) REFERENCES Users(user_id)
      );
    END;
  `);

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

  const quantity = Math.max(Number(data.quantity || 0), 0);
  const transactionType = data.transactionType || 'Yêu cầu lĩnh';

  await execute(`
    BEGIN TRANSACTION;

    INSERT INTO SupplyTransactions (supply_id, transaction_type, quantity, note, created_by)
    VALUES (@supplyId, @transactionType, @quantity, NULLIF(@note, ''), @createdBy);

    IF @transactionType = N'Xuất sử dụng'
    BEGIN
      UPDATE SupplyCatalog
      SET current_stock = CASE WHEN current_stock >= @quantity THEN current_stock - @quantity ELSE 0 END,
          updated_at = SYSDATETIME()
      WHERE supply_id = @supplyId;
    END;

    IF @transactionType = N'Nhập kho'
    BEGIN
      UPDATE SupplyCatalog
      SET current_stock = current_stock + @quantity,
          updated_at = SYSDATETIME()
      WHERE supply_id = @supplyId;
    END;

    COMMIT TRANSACTION;
  `, {
    supplyId: Number(data.supplyId),
    transactionType,
    quantity,
    note: data.note || '',
    createdBy: createdBy || null
  });
}

module.exports = {
  getSupplies,
  addSupplyTransaction
};
