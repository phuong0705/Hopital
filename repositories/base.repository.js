const { getPool, sql } = require('../config/db');
const cache = require('../services/cache');

const SLOW_QUERY_MS = Number(process.env.SLOW_QUERY_MS || 1000);

function logSlowQuery(startedAt, queryText) {
  const duration = Date.now() - startedAt;
  if (duration >= SLOW_QUERY_MS) {
    const compactSql = String(queryText || '').replace(/\s+/g, ' ').trim().slice(0, 220);
    console.warn(`[slow-query] ${duration}ms ${compactSql}`);
  }
}

function isWriteQuery(queryText) {
  return /\b(INSERT|UPDATE|DELETE|MERGE)\b/i.test(String(queryText || ''));
}

function bindParams(request, params = {}) {
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });

  return request;
}

async function query(queryText, params = {}) {
  const pool = await getPool();
  const request = bindParams(pool.request(), params);
  const startedAt = Date.now();

  try {
    const result = await request.query(queryText);
    return result.recordset;
  } finally {
    logSlowQuery(startedAt, queryText);
  }
}

async function execute(queryText, params = {}) {
  const pool = await getPool();
  const request = bindParams(pool.request(), params);
  const startedAt = Date.now();

  try {
    const result = await request.query(queryText);
    if (isWriteQuery(queryText)) {
      cache.delByPrefix('dashboard:reports:');
    }
    return result;
  } finally {
    logSlowQuery(startedAt, queryText);
  }
}

async function withTransaction(work) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  const tx = {
    async query(queryText, params = {}) {
      const request = bindParams(new sql.Request(transaction), params);
      const result = await request.query(queryText);
      return result.recordset;
    },
    async execute(queryText, params = {}) {
      const request = bindParams(new sql.Request(transaction), params);
      return request.query(queryText);
    }
  };

  try {
    const result = await work(tx);
    await transaction.commit();
    cache.delByPrefix('dashboard:reports:');
    return result;
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error('Loi rollback transaction:', rollbackError);
    }
    throw error;
  }
}

module.exports = {
  sql,
  query,
  execute,
  withTransaction
};
