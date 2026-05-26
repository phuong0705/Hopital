require('dotenv').config();

const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool) => {
        console.log('Ket noi SQL Server thanh cong');
        return pool;
      })
      .catch((err) => {
        poolPromise = null;
        console.error('Loi ket noi SQL Server:', err);
        throw err;
      });
  }

  return poolPromise;
}

module.exports = {
  sql,
  getPool,
  get poolPromise() {
    return getPool();
  }
};
