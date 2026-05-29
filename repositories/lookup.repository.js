const { query } = require('./base.repository');
const cache = require('../services/cache');

const CATEGORY_TTL_SECONDS = 10 * 60;

async function getDepartments() {
  const { value } = await cache.getOrSet('categories:departments', CATEGORY_TTL_SECONDS, () => query(`
    SELECT department_id AS departmentId, department_code AS departmentCode, department_name AS departmentName
    FROM Departments
    WHERE status = N'Hoạt động'
    ORDER BY department_name
  `));
  return value;
}

async function getDoctors() {
  const { value } = await cache.getOrSet('categories:doctors', CATEGORY_TTL_SECONDS, () => query(`
    SELECT doctor_id AS doctorId, doctor_code AS doctorCode, full_name AS fullName, specialty
    FROM Doctors
    WHERE status = N'Đang làm việc'
    ORDER BY full_name
  `));
  return value;
}

async function getRooms() {
  const { value } = await cache.getOrSet('categories:rooms', 5 * 60, () => query(`
    SELECT r.room_id AS roomId, r.room_code AS roomCode, d.department_name AS departmentName
    FROM Rooms r
    INNER JOIN Departments d ON d.department_id = r.department_id
    ORDER BY d.department_name, r.room_code
  `));
  return value;
}

module.exports = {
  getDepartments,
  getDoctors,
  getRooms
};
