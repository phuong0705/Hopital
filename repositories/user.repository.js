const { query, execute } = require('./base.repository');

async function getUsers() {
  return query(`
    SELECT u.user_id AS userId, u.username, u.email, u.full_name AS fullName,
      r.role_name AS roleName, r.role_code AS roleCode, u.status, u.created_at AS createdAt
    FROM Users u
    INNER JOIN Roles r ON r.role_id = u.role_id
    ORDER BY u.created_at DESC
  `);
}

async function getUserById(userId) {
  const rows = await query(`
    SELECT u.user_id AS userId, u.username, u.email, u.full_name AS fullName,
      u.role_id AS roleId, r.role_name AS roleName, r.role_code AS roleCode, u.status
    FROM Users u
    INNER JOIN Roles r ON r.role_id = u.role_id
    WHERE u.user_id = @userId
  `, { userId: Number(userId) });
  return rows[0];
}

async function createUser(data) {
  await execute(`
    INSERT INTO Users (role_id, username, email, password_hash, full_name, status)
    VALUES (@roleId, @username, @email, @passwordHash, @fullName, @status)
  `, {
    roleId: Number(data.roleId),
    username: data.username,
    email: data.email,
    passwordHash: data.password || '123456', // Default password if not provided
    fullName: data.fullName,
    status: data.status || 'Hoạt động'
  });
}

async function updateUser(userId, data) {
  let updateFields = `
    role_id = @roleId,
    username = @username,
    email = @email,
    full_name = @fullName,
    status = @status,
    updated_at = SYSDATETIME()
  `;
  const params = {
    userId: Number(userId),
    roleId: Number(data.roleId),
    username: data.username,
    email: data.email,
    fullName: data.fullName,
    status: data.status
  };

  if (data.password) {
    updateFields += `, password_hash = @passwordHash`;
    params.passwordHash = data.password;
  }

  await execute(`
    UPDATE Users
    SET ${updateFields}
    WHERE user_id = @userId
  `, params);
}

async function deleteUser(userId) {
  await execute(`DELETE FROM Users WHERE user_id = @userId`, { userId: Number(userId) });
}

async function getRoles() {
  return query(`SELECT role_id AS roleId, role_name AS roleName, role_code AS roleCode FROM Roles`);
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRoles
};
