const fs = require('fs/promises');
const path = require('path');
const { getPool } = require('../config/db');

function splitBatches(sqlText) {
  return sqlText
    .split(/^\s*GO\s*;?\s*$/gim)
    .map((batch) => batch.trim())
    .filter(Boolean);
}

async function main() {
  const relativePath = process.argv[2];
  if (!relativePath) {
    throw new Error('Usage: node scripts/run-sql-file.js <path-to-sql-file>');
  }

  const filePath = path.resolve(process.cwd(), relativePath);
  const sqlText = await fs.readFile(filePath, 'utf8');
  const batches = splitBatches(sqlText);
  const pool = await getPool();

  try {
    for (const batch of batches) {
      await pool.request().batch(batch);
    }
  } finally {
    await pool.close();
  }

  console.log(`Da chay xong ${batches.length} batch tu ${relativePath}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
