const { getPool } = require('../config/db');

(async () => {
  try {
    const pool = await getPool();
    
    // Check all roles in DB
    const roles = await pool.request().query('SELECT * FROM Roles');
    console.log('All roles in database:');
    console.table(roles.recordset);
    
    // Check businessGroups from config to see expected modules
    const { businessGroups } = require('../config/business-processes');
    const expectedModules = businessGroups.flatMap(g => g.items.map(i => i.key));
    console.log(`\nExpected module keys (${expectedModules.length}):`, expectedModules);
    
    // Check distinct module_keys in RoleModulePermissions
    const dbModules = await pool.request().query(`
      SELECT DISTINCT module_key 
      FROM RoleModulePermissions 
      ORDER BY module_key
    `);
    console.log(`\nModule keys in RoleModulePermissions (${dbModules.recordset.length}):`);
    console.log(dbModules.recordset.map(r => r.module_key).join(', '));
    
    // Check for mismatches
    const dbModuleSet = new Set(dbModules.recordset.map(r => r.module_key));
    const missing = expectedModules.filter(m => !dbModuleSet.has(m));
    const extra = dbModules.recordset.map(r => r.module_key).filter(m => !expectedModules.includes(m));
    if (missing.length) console.log('\nMissing in DB:', missing);
    if (extra.length) console.log('\nExtra in DB:', extra);
    
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  }
})();
