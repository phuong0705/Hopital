const { getPool, sql } = require('../config/db');

function bindParams(request, params = {}) {
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });

  return request;
}

async function query(queryText, params = {}) {
  const pool = await getPool();
  const request = bindParams(pool.request(), params);

  const result = await request.query(queryText);
  return result.recordset;
}

async function execute(queryText, params = {}) {
  const pool = await getPool();
  const request = bindParams(pool.request(), params);

  return request.query(queryText);
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
