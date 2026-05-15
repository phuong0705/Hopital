require('dotenv').config();

const sql = require('msnodesqlv8');

const driver = process.env.DB_ODBC_DRIVER || 'ODBC Driver 17 for SQL Server';
const server = process.env.DB_SERVER || 'localhost';
const database = process.env.DB_DATABASE || 'master';
const encrypt = process.env.DB_ENCRYPT === 'true' ? 'Yes' : 'No';
const trustServerCertificate = process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false' ? 'Yes' : 'No';

const connectionParts = [
  `Driver={${driver}}`,
  `Server=${server}`,
  `Database=${database}`,
  'Trusted_Connection=Yes'
];

if (process.env.DB_ENCRYPT === 'true') {
  connectionParts.push(`Encrypt=${encrypt}`);
  connectionParts.push(`TrustServerCertificate=${trustServerCertificate}`);
}

const connectionString = connectionParts.join(';') + ';';

console.log('Dang kiem tra ket noi SQL Server bang Windows Authentication...');
console.log(`Server: ${server}`);
console.log(`Database: ${database}`);
console.log(`ODBC Driver: ${driver}`);

sql.open(connectionString, (error, connection) => {
  if (error) {
    console.error('Khong ket noi duoc SQL Server.');
    console.error(error.message || error);

    if (error.details && error.details.length) {
      console.error('\nChi tiet ODBC:');
      error.details.forEach((detail) => {
        console.error(`- [${detail.sqlState}] ${detail.message}`);
      });
    }

    if (String(error.message || '').includes('Encryption not supported')) {
      console.error('\nGoi y: SQL Server/ODBC dang yeu cau ma hoa nhung client khong thuong luong duoc TLS.');
      console.error('- Kiem tra SQL Server instance co dang bat Force Encryption khong.');
      console.error('- Cap nhat Microsoft ODBC Driver for SQL Server hoac SQL Server TLS/certificate.');
      console.error('- Neu chi chay local, giu DB_ENCRYPT=false va tat Force Encryption tren SQL Server Configuration Manager.');
    }

    process.exit(1);
  }

  connection.query('SELECT DB_NAME() AS databaseName, SUSER_SNAME() AS loginName, @@SERVERNAME AS serverName', (queryError, rows) => {
    if (queryError) {
      console.error('Ket noi duoc nhung truy van that bai.');
      console.error(queryError.message || queryError);
      connection.close();
      process.exit(1);
    }

    console.log('Ket noi thanh cong:');
    console.table(rows);
    connection.close();
  });
});
