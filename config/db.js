require('dotenv').config();

const useWindowsAuth = String(process.env.DB_AUTH || '').toLowerCase() === 'windows';
let sql;

if (useWindowsAuth) {
  try {
    sql = require('mssql/msnodesqlv8');
  } catch (error) {
    throw new Error(
      'DB_AUTH=windows requires the optional msnodesqlv8 package and ODBC driver. ' +
      'Use DB_AUTH=sql on Linux/Render deployments, or install the Windows auth dependencies locally.'
    );
  }
} else {
  sql = require('mssql');
}

const databaseName = process.env.DB_NAME || process.env.DB_DATABASE;
const serverName = process.env.DB_SERVER || 'localhost';
const pool = {
  max: 10,
  min: 0,
  idleTimeoutMillis: 30000
};

function boolEnv(name, defaultValue = false) {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return String(value).toLowerCase() === 'true';
}

function buildOdbcConnectionString() {
  const driver = process.env.DB_ODBC_DRIVER || 'ODBC Driver 17 for SQL Server';
  const encrypt = boolEnv('DB_ENCRYPT') ? 'yes' : 'no';
  const trustServerCertificate = boolEnv('DB_TRUST_SERVER_CERTIFICATE', true) ? 'yes' : 'no';
  const port = Number(process.env.DB_PORT || 0);
  const server = port && !serverName.includes('\\') ? `${serverName},${port}` : serverName;

  return [
    `Driver={${driver}}`,
    `Server=${server}`,
    `Database=${databaseName}`,
    'Trusted_Connection=Yes',
    `Encrypt=${encrypt}`,
    `TrustServerCertificate=${trustServerCertificate}`
  ].join(';');
}

function buildConfig() {
  const baseConfig = {
    connectionTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 15000,
    requestTimeout: Number(process.env.DB_REQUEST_TIMEOUT_MS) || 30000,
    pool
  };

  if (!databaseName) {
    throw new Error('Missing DB_NAME or DB_DATABASE in environment.');
  }

  if (useWindowsAuth) {
    return {
      ...baseConfig,
      connectionString: buildOdbcConnectionString()
    };
  }

  return {
    ...baseConfig,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: serverName,
    database: databaseName,
    port: Number(process.env.DB_PORT) || 1433,
    options: {
      encrypt: boolEnv('DB_ENCRYPT'),
      trustServerCertificate: boolEnv('DB_TRUST_SERVER_CERTIFICATE')
    }
  };
}

const config = buildConfig();

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
