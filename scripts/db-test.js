require('dotenv').config();

const { getPool } = require('../config/db');

async function main() {
  console.log('Dang kiem tra ket noi SQL Server bang mssql...');
  console.log(`Server: ${process.env.DB_SERVER}`);
  console.log(`Database: ${process.env.DB_NAME}`);

  const pool = await getPool();
  const result = await pool.request().query('SELECT DB_NAME() AS databaseName, SUSER_SNAME() AS loginName, @@SERVERNAME AS serverName');

  console.log('Ket noi thanh cong:');
  console.table(result.recordset);
  await pool.close();
}

main().catch((error) => {
  console.error('Khong ket noi duoc SQL Server.');
  console.error(error.message || error);
  process.exit(1);
});
