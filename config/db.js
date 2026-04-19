require('dotenv').config();

const isWindowsAuth = (process.env.DB_AUTH || '').toLowerCase() === 'windows';
const sql = isWindowsAuth ? require('mssql/msnodesqlv8') : require('mssql');
const server = process.env.DB_SERVER || 'localhost';
const database = process.env.DB_DATABASE || 'QuanLyKhamChuaBenhNoiTru';
const odbcDriver = process.env.DB_ODBC_DRIVER || 'ODBC Driver 17 for SQL Server';
const encrypt = process.env.DB_ENCRYPT === 'true' ? 'Yes' : 'No';
const trustServerCertificate = process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false';

const poolOptions = {
  max: 10,
  min: 0,
  idleTimeoutMillis: 30000
};

const dbConfig = isWindowsAuth
  ? {
      connectionString: [
        `Driver={${odbcDriver}}`,
        `Server=${server}`,
        `Database=${database}`,
        'Trusted_Connection=Yes',
        `Encrypt=${encrypt}`,
        trustServerCertificate ? 'TrustServerCertificate=Yes' : 'TrustServerCertificate=No'
      ].join(';') + ';',
      pool: poolOptions
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server,
      database,
      port: Number(process.env.DB_PORT || 1433),
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate
      },
      pool: poolOptions
    };

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig);
  }
  return poolPromise;
}

module.exports = {
  sql,
  getPool
};
