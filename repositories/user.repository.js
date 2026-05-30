const { query, execute } = require('./base.repository');

async function getUsers(filters = {}) {
  const pageSize = Number(filters.pageSize || 0);
  const page = Math.max(Number(filters.page || 1), 1);
  const offset = (page - 1) * pageSize;
  const params = {};
  const whereClauses = buildUserWhereClauses(filters, params);

  if (pageSize > 0) {
    params.offset = offset;
    params.pageSize = pageSize;
  }

  const whereClause = whereClauses.length ? `WHERE ${whereClauses.join('\n      AND ')}` : '';
  const pagingClause = pageSize > 0 ? 'OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY' : '';

  return query(`
    SELECT u.user_id AS userId, u.username, u.email, u.full_name AS fullName,
      u.role_id AS roleId, r.role_name AS roleName, r.role_code AS roleCode, u.status, u.created_at AS createdAt
    FROM Users u
    INNER JOIN Roles r ON r.role_id = u.role_id
    ${whereClause}
    ORDER BY u.created_at DESC
    ${pagingClause}
  `, params);
}

function buildUserWhereClauses(filters = {}, params = {}) {
  const whereClauses = [];

  if (filters.search) {
    whereClauses.push(`(
      u.username LIKE @search
      OR u.email LIKE @search
      OR u.full_name LIKE @search
      OR r.role_name LIKE @search
      OR r.role_code LIKE @search
    )`);
    params.search = `%${filters.search}%`;
  }

  if (filters.roleCode) {
    whereClauses.push('r.role_code = @roleCode');
    params.roleCode = filters.roleCode;
  }

  if (filters.status) {
    whereClauses.push('u.status = @status');
    params.status = filters.status;
  }

  return whereClauses;
}

async function countUsers(filters = {}) {
  const params = {};
  const whereClauses = buildUserWhereClauses(filters, params);
  const whereClause = whereClauses.length ? `WHERE ${whereClauses.join('\n      AND ')}` : '';
  const rows = await query(`
    SELECT COUNT(1) AS totalRows
    FROM Users u
    INNER JOIN Roles r ON r.role_id = u.role_id
    ${whereClause}
  `, params);
  return Number(rows[0]?.totalRows || 0);
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
  countUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRoles
};
