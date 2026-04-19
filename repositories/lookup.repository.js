const { query } = require('./base.repository');

async function getDepartments() {
  return query(`
    SELECT department_id AS departmentId, department_code AS departmentCode, department_name AS departmentName
    FROM Departments
    WHERE status = N'Hoạt động'
    ORDER BY department_name
  `);
}

async function getDoctors() {
  return query(`
    SELECT doctor_id AS doctorId, doctor_code AS doctorCode, full_name AS fullName, specialty
    FROM Doctors
    WHERE status = N'Đang làm việc'
    ORDER BY full_name
  `);
}

async function getRooms() {
  return query(`
    SELECT r.room_id AS roomId, r.room_code AS roomCode, d.department_name AS departmentName
    FROM Rooms r
    INNER JOIN Departments d ON d.department_id = r.department_id
    ORDER BY d.department_name, r.room_code
  `);
}

module.exports = {
  getDepartments,
  getDoctors,
  getRooms
};
