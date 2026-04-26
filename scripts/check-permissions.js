const { getPool } = require('../config/db');

(async () => {
  try {
    const pool = await getPool();
    
    // Check if table exists
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'RoleModulePermissions'
    `);
    console.log('Table exists:', tables.recordset.length > 0);
    
    if (tables.recordset.length > 0) {
      // Check current permissions
      const perms = await pool.request().query(`
        SELECT module_key, role_code, allowed 
        FROM RoleModulePermissions 
        ORDER BY module_key, role_code
      `);
      console.log(`Total permission records: ${perms.recordset.length}`);
      console.log('Sample permissions:');
      console.table(perms.recordset.slice(0, 10));
      
      // Check for specific role
      const nursePerms = await pool.request().query(`
        SELECT module_key, allowed 
        FROM RoleModulePermissions 
        WHERE role_code = 'NURSE' AND allowed = 1
        ORDER BY module_key
      `);
      console.log(`\nNURSE allowed modules (${nursePerms.recordset.length}):`);
      console.table(nursePerms.recordset);
    }
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  }
})();
