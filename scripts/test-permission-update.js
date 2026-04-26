const { getPool } = require('../config/db');

(async () => {
  try {
    const pool = await getPool();
    
    console.log('=== BEFORE UPDATE ===');
    let perms = await pool.request().query(`
      SELECT module_key, role_code, allowed 
      FROM RoleModulePermissions 
      WHERE role_code IN ('NURSE', 'PATIENT', 'RECEPTIONIST')
      ORDER BY role_code, module_key
    `);
    console.log(`Total records for NURSE/PATIENT/RECEPTIONIST: ${perms.recordset.length}`);
    console.table(perms.recordset.slice(0, 10));
    
    // Count allowed per role
    const counts = await pool.request().query(`
      SELECT role_code, SUM(CASE WHEN allowed = 1 THEN 1 ELSE 0 END) as allowedCount
      FROM RoleModulePermissions
      GROUP BY role_code
    `);
    console.log('\nAllowed counts per role:');
    console.table(counts.recordset);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
