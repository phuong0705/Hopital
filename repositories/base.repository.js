const { getPool, sql } = require('../config/db');

async function query(queryText, params = {}) {
  const pool = await getPool();
  const request = pool.request();

  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });

  const result = await request.query(queryText);
  return result.recordset;
}

async function execute(queryText, params = {}) {
  const pool = await getPool();
  const request = pool.request();

  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });

  return request.query(queryText);
}

module.exports = {
  sql,
  query,
  execute
};
