const { query, execute } = require('./base.repository');

const { withTransaction } = require('./base.repository');
const treatmentCostRepository = require('./treatment-cost.repository');

async function getMedicalRecords(doctorId = null) {
  const whereDoctor = doctorId ? 'WHERE a.doctor_id = @doctorId' : '';

  return query(`
    SELECT mr.record_id AS recordId, mr.record_code AS recordCode, p.full_name AS patientName,
      p.patient_code AS patientCode, p.gender, mr.diagnosis_on_admission AS diagnosis,
      mr.vital_signs AS vitalSigns, mr.doctor_notes AS doctorNotes, mr.status, mr.created_at AS createdAt,
      a.admission_id AS admissionId, a.admission_date AS admissionDate, a.status AS admissionStatus,
      d.department_name AS departmentName, r.room_code AS roomCode, b.bed_code AS bedCode,
      doc.full_name AS doctorName,
      COALESCE(labStats.labCount, 0) AS labCount,
      COALESCE(labStats.pendingLabCount, 0) AS pendingLabCount,
      COALESCE(treatmentStats.treatmentCount, 0) AS treatmentCount,
      COALESCE(treatmentStats.pendingTreatmentCount, 0) AS pendingTreatmentCount,
      COALESCE(rxStats.prescriptionCount, 0) AS prescriptionCount,
      discharge.discharge_id AS dischargeId,
      discharge.discharge_date AS dischargeDate,
      discharge.payment_status AS dischargePaymentStatus
    FROM MedicalRecords mr
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    OUTER APPLY (
      SELECT COUNT(*) AS labCount,
        COUNT(CASE WHEN lt.status <> N'Đã có kết quả' THEN 1 END) AS pendingLabCount
      FROM LabTests lt
      WHERE lt.record_id = mr.record_id
    ) labStats
    OUTER APPLY (
      SELECT COUNT(*) AS treatmentCount,
        COUNT(CASE WHEN ts.status <> N'Hoàn thành' THEN 1 END) AS pendingTreatmentCount
      FROM TreatmentSchedules ts
      WHERE ts.record_id = mr.record_id
    ) treatmentStats
    OUTER APPLY (
      SELECT COUNT(*) AS prescriptionCount
      FROM Prescriptions pr
      WHERE pr.record_id = mr.record_id
    ) rxStats
    OUTER APPLY (
      SELECT TOP 1 dsc.discharge_id, dsc.discharge_date, dsc.payment_status
      FROM Discharges dsc
      WHERE dsc.admission_id = a.admission_id
      ORDER BY dsc.discharge_date DESC, dsc.discharge_id DESC
    ) discharge
    ${whereDoctor}
    ORDER BY mr.created_at DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function completeMedicalRecord(recordId, doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';
  const params = { recordId: Number(recordId) };
  if (doctorId) params.doctorId = Number(doctorId);

  await execute(`
    DECLARE @AdmissionId INT;
    DECLARE @PendingLabCount INT;
    DECLARE @PendingTreatmentCount INT;
    DECLARE @HasFinalDisposition BIT;

    SELECT @AdmissionId = mr.admission_id
    FROM MedicalRecords mr
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    WHERE mr.record_id = @recordId
      ${whereDoctor};

    IF @AdmissionId IS NULL
    BEGIN
      THROW 51007, N'Không tìm thấy hồ sơ bệnh án phù hợp để hoàn tất.', 1;
    END;

    SELECT @PendingLabCount = COUNT(*)
    FROM LabTests
    WHERE record_id = @recordId
      AND status <> N'Đã có kết quả';

    SELECT @PendingTreatmentCount = COUNT(*)
    FROM TreatmentSchedules
    WHERE record_id = @recordId
      AND status <> N'Hoàn thành';

    SELECT @HasFinalDisposition = CASE
      WHEN EXISTS (SELECT 1 FROM Discharges WHERE admission_id = @AdmissionId)
        OR EXISTS (SELECT 1 FROM Admissions WHERE admission_id = @AdmissionId AND status IN (N'Chờ xuất viện', N'Đã xuất viện'))
      THEN 1 ELSE 0 END;

    IF @PendingLabCount > 0 OR @PendingTreatmentCount > 0 OR @HasFinalDisposition = 0
    BEGIN
      THROW 51008, N'Hồ sơ chưa đủ điều kiện hoàn tất: cần đủ kết quả cận lâm sàng, y lệnh hoàn thành và quyết định ra viện.', 1;
    END;

    UPDATE MedicalRecords
    SET status = N'Hoàn tất',
        updated_at = SYSDATETIME()
    WHERE record_id = @recordId;
  `, params);
}

async function getMedicalRecordDetail(recordId, doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';

  const rows = await query(`
    SELECT TOP 1 mr.*, p.patient_code, p.full_name, p.date_of_birth, p.gender, p.phone,
      p.address, a.admission_date, d.department_name, doc.full_name AS doctor_name
    FROM MedicalRecords mr
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    LEFT JOIN Admissions a ON a.admission_id = mr.admission_id
    LEFT JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    WHERE mr.record_id = @recordId
      ${whereDoctor}
  `, doctorId ? { recordId, doctorId: Number(doctorId) } : { recordId });

  const medicines = await query(`
    SELECT pr.prescription_code AS prescriptionCode, pi.medicine_name AS medicineName, pi.dosage,
      pi.frequency, pi.route, pr.start_date AS startDate, pr.end_date AS endDate
    FROM Prescriptions pr
    INNER JOIN PrescriptionItems pi ON pi.prescription_id = pr.prescription_id
    WHERE pr.record_id = @recordId
    ORDER BY pr.start_date DESC
  `, { recordId });

  const labs = await query(`
    SELECT test_type AS testType, ordered_date AS orderedDate, status, result_summary AS resultSummary
    FROM LabTests
    WHERE record_id = @recordId
    ORDER BY ordered_date DESC
  `, { recordId });

  const treatments = await query(`
    SELECT scheduled_time AS scheduledTime, treatment_content AS treatmentContent,
      assignee_name AS assigneeName, status, note
    FROM TreatmentSchedules
    WHERE record_id = @recordId
    ORDER BY scheduled_time DESC
  `, { recordId });

  const costs = await treatmentCostRepository.getCostsByRecord(recordId);

  return {
    record: rows[0],
    medicines,
    labs,
    treatments,
    costs
  };
}

async function getDepartmentsOverview() {
  return query(`
    SELECT d.department_id AS departmentId, d.department_code AS departmentCode, d.department_name AS departmentName,
      d.head_doctor AS headDoctor, COUNT(DISTINCT r.room_id) AS roomCount, COUNT(b.bed_id) AS totalBeds,
      COUNT(CASE WHEN b.status = N'Đang sử dụng' THEN 1 END) AS usedBeds,
      COUNT(CASE WHEN b.status = N'Trống' THEN 1 END) AS availableBeds
    FROM Departments d
    LEFT JOIN Rooms r ON r.department_id = d.department_id
    LEFT JOIN Beds b ON b.room_id = r.room_id
    GROUP BY d.department_id, d.department_code, d.department_name, d.head_doctor
    ORDER BY d.department_name
  `);
}

async function getDepartmentDetail(departmentId) {
  const rows = await query(`
    SELECT d.department_id AS departmentId, d.department_code AS departmentCode, d.department_name AS departmentName,
      d.head_doctor AS headDoctor, d.phone, d.location, d.status,
      (SELECT COUNT(*) FROM Rooms WHERE department_id = d.department_id) AS roomCount,
      (SELECT COUNT(*) FROM Beds b INNER JOIN Rooms r ON r.room_id = b.room_id WHERE r.department_id = d.department_id) AS totalBeds,
      (SELECT COUNT(*) FROM Beds b INNER JOIN Rooms r ON r.room_id = b.room_id WHERE r.department_id = d.department_id AND b.status = N'Đang sử dụng') AS usedBeds,
      (SELECT COUNT(*) FROM Beds b INNER JOIN Rooms r ON r.room_id = b.room_id WHERE r.department_id = d.department_id AND b.status = N'Trống') AS availableBeds
    FROM Departments d
    WHERE d.department_id = @departmentId
  `, { departmentId: Number(departmentId) });
  return rows[0];
}

async function createDepartment(data) {
  await execute(`
    INSERT INTO Departments (department_code, department_name, head_doctor, phone, location, status)
    VALUES (@departmentCode, @departmentName, @headDoctor, @phone, @location, @status)
  `, {
    departmentCode: data.departmentCode,
    departmentName: data.departmentName,
    headDoctor: data.headDoctor || '',
    phone: data.phone || '',
    location: data.location || '',
    status: data.status || 'Hoạt động'
  });
}

async function updateDepartment(departmentId, data) {
  await execute(`
    UPDATE Departments
    SET department_code = @departmentCode,
        department_name = @departmentName,
        head_doctor = @headDoctor,
        phone = @phone,
        location = @location,
        status = @status
    WHERE department_id = @departmentId
  `, {
    departmentId: Number(departmentId),
    departmentCode: data.departmentCode,
    departmentName: data.departmentName,
    headDoctor: data.headDoctor,
    phone: data.phone,
    location: data.location,
    status: data.status
  });
}

async function deleteDepartment(departmentId) {
  await execute(`
    IF EXISTS (SELECT 1 FROM Rooms WHERE department_id = @departmentId)
       OR EXISTS (SELECT 1 FROM Doctors WHERE department_id = @departmentId)
       OR EXISTS (SELECT 1 FROM Admissions WHERE department_id = @departmentId)
    BEGIN
      THROW 51001, N'Không thể xóa khoa còn phòng, bác sĩ hoặc hồ sơ bệnh nhân liên quan.', 1;
    END;

    DELETE FROM Departments WHERE department_id = @departmentId;
  `, { departmentId: Number(departmentId) });
}

async function getDepartmentRooms(departmentId) {
  return query(`
    SELECT r.room_id AS roomId, r.room_code AS roomCode, r.room_name AS roomName, r.floor_no AS floorNo, r.room_type AS roomType, r.status,
      (SELECT COUNT(*) FROM Beds WHERE room_id = r.room_id) AS totalBeds,
      (SELECT COUNT(*) FROM Beds WHERE room_id = r.room_id AND status = N'Đang sử dụng') AS usedBeds
    FROM Rooms r
    WHERE r.department_id = @departmentId
    ORDER BY r.room_code
  `, { departmentId: Number(departmentId) });
}

async function getDepartmentBeds(departmentId) {
  return query(`
    SELECT b.bed_id AS bedId, b.bed_code AS bedCode, b.status, b.note, r.room_code AS roomCode, r.room_type AS roomType, p.full_name AS patientName
    FROM Beds b
    INNER JOIN Rooms r ON r.room_id = b.room_id
    LEFT JOIN Admissions a ON a.bed_id = b.bed_id AND a.status = N'Đang điều trị'
    LEFT JOIN Patients p ON p.patient_id = a.patient_id
    WHERE r.department_id = @departmentId
    ORDER BY r.room_code, b.bed_code
  `, { departmentId: Number(departmentId) });
}

async function getDepartmentPatients(departmentId) {
  return query(`
    SELECT p.patient_id AS patientId, p.patient_code AS patientCode, p.full_name AS fullName, a.initial_diagnosis AS diagnosis, r.room_code AS roomCode, b.bed_code AS bedCode, a.admission_date AS admissionDate
    FROM Admissions a
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    INNER JOIN Rooms r ON r.room_id = a.room_id
    INNER JOIN Beds b ON b.bed_id = a.bed_id
    WHERE a.department_id = @departmentId AND a.status = N'Đang điều trị'
    ORDER BY a.admission_date DESC
  `, { departmentId: Number(departmentId) });
}

async function getDepartmentStaff(departmentId) {
  const doctors = await query(`
    SELECT doctor_code AS code, full_name AS name, specialty, shift_name AS shift, N'Bác sĩ' AS role
    FROM Doctors
    WHERE department_id = @departmentId AND status = N'Đang làm việc'
  `, { departmentId: Number(departmentId) });
  
  const nurses = await query(`
    SELECT u.username AS code, u.full_name AS name, '' AS specialty, '' AS shift, N'Điều dưỡng' AS role
    FROM Users u
    INNER JOIN Roles r ON r.role_id = u.role_id
    WHERE u.department_id = @departmentId AND r.role_code = 'NURSE' AND u.status = N'Hoạt động'
  `, { departmentId: Number(departmentId) });
  
  return [...doctors, ...nurses];
}

async function createRoom(data) {
  await execute(`
    IF (
      SELECT COUNT(*)
      FROM Rooms
      WHERE department_id = @departmentId
    ) >= 100
    BEGIN
      THROW 51016, N'Mỗi khoa chỉ được tối đa 100 phòng.', 1;
    END;

    INSERT INTO Rooms (department_id, room_code, room_name, floor_no, room_type)
    VALUES (@departmentId, @roomCode, @roomName, @floorNo, @roomType)
  `, {
    departmentId: Number(data.departmentId),
    roomCode: data.roomCode,
    roomName: data.roomName || '',
    floorNo: Number(data.floorNo || 1),
    roomType: data.roomType || 'Thường'
  });
}

async function updateRoom(roomId, data) {
  await execute(`
    UPDATE Rooms
    SET room_code = @roomCode, room_name = @roomName, floor_no = @floorNo, room_type = @roomType
    WHERE room_id = @roomId
  `, {
    roomId: Number(roomId),
    roomCode: data.roomCode,
    roomName: data.roomName || '',
    floorNo: Number(data.floorNo),
    roomType: data.roomType
  });
}

async function deleteRoom(roomId) {
  await execute(`DELETE FROM Rooms WHERE room_id = @roomId`, { roomId: Number(roomId) });
}

async function createBed(data) {
  await execute(`
    IF (
      SELECT COUNT(*)
      FROM Beds
      WHERE room_id = @roomId
    ) >= 4
    BEGIN
      THROW 51017, N'Mỗi phòng chỉ được tối đa 4 giường.', 1;
    END;

    INSERT INTO Beds (room_id, bed_code, status, note)
    VALUES (@roomId, @bedCode, @status, @note)
  `, {
    roomId: Number(data.roomId),
    bedCode: data.bedCode,
    status: data.status || 'Trống',
    note: data.note || ''
  });
}

async function updateBed(bedId, data) {
  await execute(`
    UPDATE Beds
    SET bed_code = @bedCode, status = @status, note = @note
    WHERE bed_id = @bedId
  `, {
    bedId: Number(bedId),
    bedCode: data.bedCode,
    status: data.status,
    note: data.note || ''
  });
}

async function deleteBed(bedId) {
  await execute(`DELETE FROM Beds WHERE bed_id = @bedId`, { bedId: Number(bedId) });
}

async function getBeds(departmentId = null) {
  const whereDepartment = departmentId ? 'WHERE r.department_id = @departmentId' : '';

  return query(`
    SELECT b.bed_id AS bedId, b.bed_code AS bedCode, r.room_id AS roomId,
      r.room_code AS roomCode, r.room_name AS roomName, d.department_id AS departmentId,
      d.department_name AS departmentName, r.room_type AS roomType, b.status,
      p.patient_code AS patientCode, p.full_name AS patientName, a.admission_date AS startDate
    FROM Beds b
    INNER JOIN Rooms r ON r.room_id = b.room_id
    INNER JOIN Departments d ON d.department_id = r.department_id
    LEFT JOIN Admissions a ON a.bed_id = b.bed_id AND a.status IN (N'Chờ xếp giường', N'Đang điều trị', N'Theo dõi', N'Ổn định', N'Chờ xuất viện')
    LEFT JOIN Patients p ON p.patient_id = a.patient_id
    ${whereDepartment}
    ORDER BY d.department_name, r.room_code, b.bed_code
  `, departmentId ? { departmentId: Number(departmentId) } : {});
}

async function getRoomDetail(roomId, departmentId = null) {
  const whereDepartment = departmentId ? 'AND r.department_id = @departmentId' : '';
  const params = { roomId: Number(roomId) };
  if (departmentId) params.departmentId = Number(departmentId);

  const roomRows = await query(`
    SELECT r.room_id AS roomId, r.room_code AS roomCode, r.room_name AS roomName,
      r.floor_no AS floorNo, r.room_type AS roomType, r.status,
      d.department_id AS departmentId, d.department_name AS departmentName
    FROM Rooms r
    INNER JOIN Departments d ON d.department_id = r.department_id
    WHERE r.room_id = @roomId
      ${whereDepartment}
  `, params);

  if (!roomRows.length) return null;

  const beds = await query(`
    SELECT b.bed_id AS bedId, b.bed_code AS bedCode, b.status, b.note,
      p.patient_code AS patientCode, p.full_name AS patientName,
      a.admission_id AS admissionId, a.admission_date AS admissionDate
    FROM Beds b
    INNER JOIN Rooms r ON r.room_id = b.room_id
    LEFT JOIN Admissions a ON a.bed_id = b.bed_id AND a.status IN (N'Chờ xếp giường', N'Đang điều trị', N'Theo dõi', N'Ổn định', N'Chờ xuất viện')
    LEFT JOIN Patients p ON p.patient_id = a.patient_id
    WHERE b.room_id = @roomId
      ${whereDepartment}
    ORDER BY b.bed_code
  `, params);

  return {
    room: roomRows[0],
    beds
  };
}

async function ensureDepartmentRoomSeed(departmentId, targetRooms = 10, bedsPerRoom = 4) {
  await execute(`
    DECLARE @departmentId INT = @inputDepartmentId;
    DECLARE @targetRooms INT = @inputTargetRooms;
    DECLARE @bedsPerRoom INT = @inputBedsPerRoom;

    IF @targetRooms > 100
      THROW 51018, N'Mỗi khoa chỉ được tối đa 100 phòng.', 1;

    IF @bedsPerRoom > 4
      THROW 51019, N'Mỗi phòng chỉ được tối đa 4 giường.', 1;

    DECLARE @roomCount INT = (
      SELECT COUNT(*)
      FROM Rooms
      WHERE department_id = @departmentId
    );

    DECLARE @nextIndex INT = @roomCount + 1;
    WHILE @roomCount < @targetRooms
    BEGIN
      DECLARE @roomCode NVARCHAR(30) = CONCAT(N'A', FORMAT(@nextIndex, '000'));
      WHILE EXISTS (SELECT 1 FROM Rooms WHERE department_id = @departmentId AND room_code = @roomCode)
      BEGIN
        SET @nextIndex += 1;
        SET @roomCode = CONCAT(N'A', FORMAT(@nextIndex, '000'));
      END;

      INSERT INTO Rooms (department_id, room_code, room_name, floor_no, room_type, status)
      VALUES (@departmentId, @roomCode, CONCAT(N'Phòng ', @roomCode), 1, N'Thường', N'Hoạt động');

      SET @roomCount += 1;
      SET @nextIndex += 1;
    END;

    DECLARE @roomId INT, @roomCodeCursor NVARCHAR(30), @bedCount INT, @bedIndex INT, @bedCode NVARCHAR(30);
    DECLARE room_cursor CURSOR LOCAL FAST_FORWARD FOR
      SELECT TOP (@targetRooms) room_id, room_code
      FROM Rooms
      WHERE department_id = @departmentId
      ORDER BY room_code;

    OPEN room_cursor;
    FETCH NEXT FROM room_cursor INTO @roomId, @roomCodeCursor;
    WHILE @@FETCH_STATUS = 0
    BEGIN
      SELECT @bedCount = COUNT(*) FROM Beds WHERE room_id = @roomId;
      SET @bedIndex = @bedCount + 1;

      WHILE @bedCount < @bedsPerRoom
      BEGIN
        SET @bedCode = CONCAT(@roomCodeCursor, N'-', FORMAT(@bedIndex, '00'));

        IF NOT EXISTS (SELECT 1 FROM Beds WHERE bed_code = @bedCode)
        BEGIN
          INSERT INTO Beds (room_id, bed_code, status, note)
          VALUES (@roomId, @bedCode, N'Trống', N'Seed theo workflow 4 giường/phòng');
          SET @bedCount += 1;
        END;

        SET @bedIndex += 1;
      END;

      FETCH NEXT FROM room_cursor INTO @roomId, @roomCodeCursor;
    END;

    CLOSE room_cursor;
    DEALLOCATE room_cursor;
  `, {
    inputDepartmentId: Number(departmentId),
    inputTargetRooms: Number(targetRooms),
    inputBedsPerRoom: Number(bedsPerRoom)
  });
}

async function getAvailableBeds(departmentId = null) {
  const whereDepartment = departmentId ? 'AND r.department_id = @departmentId' : '';

  return query(`
    SELECT b.bed_id AS bedId, b.bed_code AS bedCode, r.room_code AS roomCode, d.department_name AS departmentName
    FROM Beds b
    INNER JOIN Rooms r ON r.room_id = b.room_id
    INNER JOIN Departments d ON d.department_id = r.department_id
    WHERE b.status = N'Trống'
      ${whereDepartment}
    ORDER BY d.department_name, r.room_code, b.bed_code
  `, departmentId ? { departmentId: Number(departmentId) } : {});
}

async function getActiveAdmissions(doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';

  return query(`
    SELECT a.admission_id AS admissionId, p.patient_code AS patientCode, p.full_name AS patientName,
      d.department_name AS departmentName, r.room_code AS roomCode, b.bed_code AS bedCode,
      a.status, a.admission_date AS admissionDate, doc.full_name AS doctorName
    FROM Admissions a
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    WHERE a.status IN (N'Chờ xếp giường', N'Đang điều trị', N'Theo dõi', N'Ổn định', N'Chờ xuất viện')
      ${whereDoctor}
    ORDER BY CASE WHEN a.room_id IS NULL OR a.bed_id IS NULL THEN 0 ELSE 1 END, a.admission_date DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function transferBed(data, doctorId = null, departmentId = null) {
  const whereDoctor = doctorId ? 'AND doctor_id = @doctorId' : '';
  const whereDepartment = departmentId ? 'AND r.department_id = @departmentId' : '';
  const params = {
    admissionId: Number(data.admissionId),
    bedId: Number(data.bedId)
  };
  if (doctorId) params.doctorId = Number(doctorId);
  if (departmentId) params.departmentId = Number(departmentId);

  await execute(`
    DECLARE @oldBedId INT, @patientId INT, @newRoomId INT, @newDepartmentId INT;

    SELECT @oldBedId = bed_id, @patientId = patient_id
    FROM Admissions
    WHERE admission_id = @admissionId
      ${whereDoctor};

    IF NOT EXISTS (
      SELECT 1
      FROM Admissions
      WHERE admission_id = @admissionId
        ${whereDoctor}
    )
    BEGIN
      THROW 51009, N'Không tìm thấy lượt điều trị thuộc phạm vi phụ trách.', 1;
    END;

    IF EXISTS (
      SELECT 1
      FROM Admissions
      WHERE patient_id = @patientId
        AND admission_id <> @admissionId
        AND bed_id IS NOT NULL
        AND status IN (N'Chờ xếp giường', N'Đang điều trị', N'Theo dõi', N'Ổn định', N'Chờ xuất viện')
    )
    BEGIN
      THROW 51020, N'Bệnh nhân này đang có giường active khác. Vui lòng hoàn tất/chuyển lượt điều trị cũ trước.', 1;
    END;

    SELECT @newRoomId = r.room_id, @newDepartmentId = r.department_id
    FROM Beds b
    INNER JOIN Rooms r ON r.room_id = b.room_id
    WHERE b.bed_id = @bedId AND b.status = N'Trống'
      ${whereDepartment}

    IF @newRoomId IS NULL
    BEGIN
      THROW 51000, N'Giường được chọn không còn trống.', 1;
    END;

    IF EXISTS (
      SELECT 1
      FROM Admissions
      WHERE bed_id = @bedId
        AND admission_id <> @admissionId
        AND status IN (N'Chờ xếp giường', N'Đang điều trị', N'Theo dõi', N'Ổn định', N'Chờ xuất viện')
    )
    BEGIN
      THROW 51021, N'Giường đã có bệnh nhân khác trong lượt điều trị active.', 1;
    END;

    UPDATE Admissions
    SET bed_id = @bedId,
        room_id = @newRoomId,
        department_id = @newDepartmentId,
        status = N'Đang điều trị'
    WHERE admission_id = @admissionId;

    UPDATE MedicalRecords
    SET status = N'Đang điều trị',
        updated_at = SYSDATETIME()
    WHERE admission_id = @admissionId;

    UPDATE Beds SET status = N'Trống' WHERE bed_id = @oldBedId;
    UPDATE Beds SET status = N'Đang sử dụng' WHERE bed_id = @bedId;
  `, params);
}

async function reconcileBedOccupancy(departmentId = null) {
  const whereDepartment = departmentId ? 'AND r.department_id = @departmentId' : '';

  await execute(`
    UPDATE b
    SET b.status = CASE
      WHEN EXISTS (
        SELECT 1
        FROM Admissions a
        WHERE a.bed_id = b.bed_id
          AND a.status IN (N'Chờ xếp giường', N'Đang điều trị', N'Theo dõi', N'Ổn định', N'Chờ xuất viện')
      ) THEN N'Đang sử dụng'
      WHEN b.status = N'Đang sử dụng' THEN N'Trống'
      ELSE b.status
    END
    FROM Beds b
    INNER JOIN Rooms r ON r.room_id = b.room_id
    WHERE 1 = 1
      ${whereDepartment};
  `, departmentId ? { departmentId: Number(departmentId) } : {});
}

async function requestAdmissionBed(admissionId, doctorId = null) {
  const whereDoctor = doctorId ? 'AND doctor_id = @doctorId' : '';
  const params = { admissionId: Number(admissionId) };
  if (doctorId) params.doctorId = Number(doctorId);

  await execute(`
    IF NOT EXISTS (
      SELECT 1
      FROM Admissions
      WHERE admission_id = @admissionId
        ${whereDoctor}
        AND status NOT IN (N'Đã hủy', N'Đã xuất viện')
    )
    BEGIN
      THROW 51009, N'Không tìm thấy lượt điều trị phù hợp để gửi nhập viện.', 1;
    END;

    IF EXISTS (
      SELECT 1
      FROM Admissions
      WHERE admission_id = @admissionId
        AND room_id IS NOT NULL
        AND bed_id IS NOT NULL
    )
    BEGIN
      THROW 51010, N'Bệnh nhân đã được xếp buồng/giường.', 1;
    END;

    UPDATE Admissions
    SET status = N'Chờ xếp giường'
    WHERE admission_id = @admissionId;

    UPDATE MedicalRecords
    SET status = N'Chờ xếp giường',
        updated_at = SYSDATETIME()
    WHERE admission_id = @admissionId;
  `, params);
}

async function getDoctors() {
  return query(`
    SELECT doc.doctor_id AS doctorId, doc.doctor_code AS doctorCode, doc.full_name AS fullName,
      doc.specialty, doc.phone, doc.email, doc.shift_name AS shiftName, doc.department_id AS departmentId,
      dept.department_name AS departmentName, doc.status,
      COUNT(CASE WHEN a.status = N'Đang điều trị' THEN 1 END) AS patientCount
    FROM Doctors doc
    LEFT JOIN Departments dept ON dept.department_id = doc.department_id
    LEFT JOIN Admissions a ON a.doctor_id = doc.doctor_id
    GROUP BY doc.doctor_id, doc.doctor_code, doc.full_name, doc.specialty, doc.phone, doc.email, doc.shift_name, doc.department_id, dept.department_name, doc.status
    ORDER BY doc.full_name
  `);
}

async function createDoctor(data) {
  await execute(`
    INSERT INTO Doctors (department_id, doctor_code, full_name, specialty, phone, email, shift_name, status)
    VALUES (@departmentId, @doctorCode, @fullName, @specialty, @phone, @email, @shiftName, @status)
  `, {
    departmentId: Number(data.departmentId),
    doctorCode: data.doctorCode,
    fullName: data.fullName,
    specialty: data.specialty,
    phone: data.phone || '',
    email: data.email || '',
    shiftName: data.shiftName || '',
    status: data.status || 'Đang làm việc'
  });
}

async function updateDoctor(doctorId, data) {
  await execute(`
    UPDATE Doctors
    SET department_id = @departmentId,
        doctor_code = @doctorCode,
        full_name = @fullName,
        specialty = @specialty,
        phone = @phone,
        email = @email,
        shift_name = @shiftName,
        status = @status
    WHERE doctor_id = @doctorId
  `, {
    doctorId: Number(doctorId),
    departmentId: Number(data.departmentId),
    doctorCode: data.doctorCode,
    fullName: data.fullName,
    specialty: data.specialty,
    phone: data.phone,
    email: data.email,
    shiftName: data.shiftName,
    status: data.status
  });
}

async function deleteDoctor(doctorId) {
  // Check for dependencies (admissions)
  const admissions = await query(`SELECT COUNT(*) as count FROM Admissions WHERE doctor_id = @doctorId`, { doctorId: Number(doctorId) });
  if (admissions[0].count > 0) {
    throw new Error('Không thể xóa bác sĩ đang có hồ sơ điều trị.');
  }
  await execute(`DELETE FROM Doctors WHERE doctor_id = @doctorId`, { doctorId: Number(doctorId) });
}

async function getTreatmentDoctorsOverview() {
  return query(`
    DECLARE @workDate DATE = (
      SELECT COALESCE(MAX(CAST(scheduled_time AS date)), CAST(GETDATE() AS date))
      FROM TreatmentSchedules
    );

    SELECT doc.doctor_id AS doctorId, doc.doctor_code AS doctorCode, doc.full_name AS fullName,
      doc.specialty, doc.shift_name AS shiftName, d.department_name AS departmentName,
      COUNT(DISTINCT a.admission_id) AS patientCount,
      COUNT(ts.schedule_id) AS scheduleCount,
      COUNT(CASE WHEN ts.status = N'Hoàn thành' THEN 1 END) AS completedCount,
      MIN(ts.scheduled_time) AS firstScheduleTime
    FROM Doctors doc
    INNER JOIN Departments d ON d.department_id = doc.department_id
    LEFT JOIN Admissions a ON a.doctor_id = doc.doctor_id
      AND a.status IN (N'Đang điều trị', N'Theo dõi', N'Ổn định', N'Chờ xuất viện')
    LEFT JOIN MedicalRecords mr ON mr.admission_id = a.admission_id
    LEFT JOIN TreatmentSchedules ts ON ts.record_id = mr.record_id
      AND CAST(ts.scheduled_time AS date) = @workDate
    WHERE doc.status = N'Đang làm việc'
    GROUP BY doc.doctor_id, doc.doctor_code, doc.full_name, doc.specialty, doc.shift_name, d.department_name
    ORDER BY doc.full_name
  `);
}

async function ensureDoctorUserLinkColumn() {
  await execute(`
    IF COL_LENGTH('Doctors', 'user_id') IS NULL
    BEGIN
      ALTER TABLE Doctors ADD user_id INT NULL;
    END;
  `);

  await execute(`
    UPDATE doc
    SET user_id = u.user_id
    FROM Doctors doc
    INNER JOIN Users u ON u.full_name = doc.full_name
    INNER JOIN Roles r ON r.role_id = u.role_id
    WHERE r.role_code = 'DOCTOR'
      AND doc.user_id IS NULL;
  `);
}

async function getDoctorByUser(userOrFullName) {
  await ensureDoctorUserLinkColumn();

  const user = typeof userOrFullName === 'object' && userOrFullName !== null
    ? userOrFullName
    : { fullName: userOrFullName };

  const rows = await query(`
    SELECT TOP 1 doc.doctor_id AS doctorId, doc.doctor_code AS doctorCode, doc.full_name AS fullName,
      doc.specialty, doc.shift_name AS shiftName, doc.department_id AS departmentId, dept.department_name AS departmentName
    FROM Doctors doc
    LEFT JOIN Departments dept ON dept.department_id = doc.department_id
    WHERE (doc.user_id = @userId)
       OR (@userId IS NULL AND doc.full_name = @fullName)
       OR (doc.user_id IS NULL AND doc.full_name = @fullName)
    ORDER BY
      CASE WHEN doc.user_id = @userId THEN 0 ELSE 1 END,
      CASE WHEN doc.status = N'Đang làm việc' THEN 0 ELSE 1 END,
      doc.doctor_id
  `, {
    userId: user.userId ? Number(user.userId) : null,
    fullName: user.fullName || ''
  });

  return rows[0];
}

async function getTreatments(doctorId) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';

  return query(`
    DECLARE @workDate DATE = (
      SELECT COALESCE(MAX(CAST(scheduled_time AS date)), CAST(GETDATE() AS date))
      FROM TreatmentSchedules
      ${doctorId ? `
      WHERE record_id IN (
        SELECT mr.record_id
        FROM MedicalRecords mr
        INNER JOIN Admissions a ON a.admission_id = mr.admission_id
        WHERE a.doctor_id = @doctorId
      )` : ''}
    );

    SELECT ts.schedule_id AS scheduleId, ts.scheduled_time AS scheduledTime,
      mr.record_id AS recordId,
      p.patient_code AS patientCode, p.full_name AS patientName, p.gender,
      a.priority_level AS priorityLevel, a.initial_diagnosis AS diagnosis,
      d.department_name AS departmentName, r.room_code AS roomCode, b.bed_code AS bedCode,
      doc.doctor_id AS doctorId, doc.full_name AS doctorName,
      ts.treatment_content AS treatmentContent, ts.assignee_name AS assigneeName, ts.status, ts.note
    FROM TreatmentSchedules ts
    INNER JOIN MedicalRecords mr ON mr.record_id = ts.record_id
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    INNER JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    WHERE CAST(ts.scheduled_time AS date) = @workDate
      ${whereDoctor}
    ORDER BY ts.scheduled_time, p.full_name
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function updateTreatmentStatus(scheduleId, data, doctorId = null) {
  const allowedStatuses = ['Chưa thực hiện', 'Đang thực hiện', 'Hoàn thành'];
  const status = allowedStatuses.includes(data.status) ? data.status : 'Chưa thực hiện';
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';
  const params = {
    scheduleId: Number(scheduleId),
    status,
    note: data.note || ''
  };
  if (doctorId) params.doctorId = Number(doctorId);

  await execute(`
    UPDATE ts
    SET ts.status = @status,
        ts.note = NULLIF(@note, '')
    FROM TreatmentSchedules ts
    INNER JOIN MedicalRecords mr ON mr.record_id = ts.record_id
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    WHERE ts.schedule_id = @scheduleId
      ${whereDoctor};

    IF @@ROWCOUNT = 0
    BEGIN
      THROW 51010, N'Không tìm thấy y lệnh thuộc phạm vi phụ trách.', 1;
    END;
  `, params);

  if (status === 'Hoàn thành') {
    await treatmentCostRepository.markTreatmentPerformed(scheduleId, data.performedBy || data.assigneeName || '');
  }
}

async function getNursingWorklist(doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';

  return query(`
    SELECT TOP 20 a.admission_id AS admissionId, p.patient_id AS patientId,
      p.patient_code AS patientCode, p.full_name AS patientName,
      d.department_name AS departmentName, r.room_code AS roomCode, b.bed_code AS bedCode,
      a.doctor_id AS doctorId, a.priority_level AS priorityLevel, mr.vital_signs AS vitalSigns,
      ts.scheduled_time AS scheduledTime, ts.treatment_content AS treatmentContent,
      ts.status AS treatmentStatus, ts.assignee_name AS assigneeName
    FROM Admissions a
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    LEFT JOIN MedicalRecords mr ON mr.admission_id = a.admission_id
    OUTER APPLY (
      SELECT TOP 1 scheduled_time, treatment_content, status, assignee_name
      FROM TreatmentSchedules ts
      WHERE ts.record_id = mr.record_id
      ORDER BY
        CASE WHEN ts.status = N'Chưa thực hiện' THEN 0 ELSE 1 END,
        ts.scheduled_time
    ) ts
    WHERE a.status IN (N'Đang điều trị', N'Theo dõi', N'Ổn định')
      ${whereDoctor}
    ORDER BY CASE a.priority_level WHEN N'Nguy cấp' THEN 0 WHEN N'Cao' THEN 1 ELSE 2 END, a.admission_date DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function getPrescriptions(doctorId = null) {
  await treatmentCostRepository.syncExistingTreatmentCosts();

  const whereDoctor = doctorId ? 'WHERE pr.doctor_id = @doctorId' : '';

  return query(`
    SELECT pr.prescription_id AS prescriptionId, pr.prescription_code AS prescriptionCode,
      p.patient_code AS patientCode, p.full_name AS patientName, p.gender, p.date_of_birth AS dateOfBirth,
      mr.record_code AS recordCode, d.department_name AS departmentName,
      pi.medicine_name AS medicineName,
      pi.dosage, pi.frequency, pi.route, pi.quantity, pi.unit,
      pr.start_date AS startDate, pr.end_date AS endDate,
      doc.full_name AS doctorName,
      medicineCost.status AS dispenseStatus
    FROM Prescriptions pr
    INNER JOIN MedicalRecords mr ON mr.record_id = pr.record_id
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    LEFT JOIN Admissions a ON a.admission_id = mr.admission_id
    LEFT JOIN Departments d ON d.department_id = a.department_id
    INNER JOIN Doctors doc ON doc.doctor_id = pr.doctor_id
    INNER JOIN PrescriptionItems pi ON pi.prescription_id = pr.prescription_id
    OUTER APPLY (
      SELECT TOP 1 status
      FROM TreatmentCosts
      WHERE source_type = N'PRESCRIPTION_ITEM'
        AND source_id = pi.item_id
      ORDER BY cost_id DESC
    ) medicineCost
    ${whereDoctor}
    ORDER BY pr.start_date DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function getPrescriptionPrintData(prescriptionId, doctorId = null) {
  const whereDoctor = doctorId ? 'AND pr.doctor_id = @doctorId' : '';
  const params = { prescriptionId: Number(prescriptionId) };
  if (doctorId) params.doctorId = Number(doctorId);

  const rows = await query(`
    SELECT pr.prescription_id AS prescriptionId, pr.prescription_code AS prescriptionCode,
      pr.start_date AS startDate, pr.end_date AS endDate, pr.note,
      p.patient_code AS patientCode, p.full_name AS patientName, p.gender, p.date_of_birth AS dateOfBirth,
      mr.record_code AS recordCode, mr.diagnosis_on_admission AS diagnosis, mr.allergies,
      a.initial_diagnosis AS initialDiagnosis, d.department_name AS departmentName,
      r.room_code AS roomCode, b.bed_code AS bedCode,
      doc.full_name AS doctorName,
      pi.medicine_name AS medicineName, pi.dosage, pi.frequency, pi.route, pi.quantity, pi.unit
    FROM Prescriptions pr
    INNER JOIN MedicalRecords mr ON mr.record_id = pr.record_id
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    LEFT JOIN Admissions a ON a.admission_id = mr.admission_id
    LEFT JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    INNER JOIN Doctors doc ON doc.doctor_id = pr.doctor_id
    INNER JOIN PrescriptionItems pi ON pi.prescription_id = pr.prescription_id
    WHERE pr.prescription_id = @prescriptionId
      ${whereDoctor}
    ORDER BY pi.item_id
  `, params);

  if (!rows.length) return null;

  const first = rows[0];
  return {
    prescription: {
      prescriptionId: first.prescriptionId,
      prescriptionCode: first.prescriptionCode,
      startDate: first.startDate,
      endDate: first.endDate,
      note: first.note
    },
    patient: {
      patientCode: first.patientCode,
      patientName: first.patientName,
      gender: first.gender,
      dateOfBirth: first.dateOfBirth
    },
    record: {
      recordCode: first.recordCode,
      diagnosis: first.diagnosis || first.initialDiagnosis || '',
      allergies: first.allergies || ''
    },
    care: {
      departmentName: first.departmentName,
      roomCode: first.roomCode,
      bedCode: first.bedCode,
      doctorName: first.doctorName
    },
    medicines: rows.map((row) => ({
      medicineName: row.medicineName,
      dosage: row.dosage,
      frequency: row.frequency,
      route: row.route,
      quantity: row.quantity,
      unit: row.unit
    }))
  };
}

async function getFinalActionWorklist(doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';

  return query(`
    SELECT a.admission_id AS admissionId,
      mr.record_id AS recordId,
      mr.record_code AS recordCode,
      p.patient_id AS patientId,
      p.patient_code AS patientCode,
      p.full_name AS patientName,
      p.gender,
      p.date_of_birth AS dateOfBirth,
      COALESCE(NULLIF(mr.diagnosis_on_admission, N''), a.initial_diagnosis) AS diagnosis,
      a.admission_date AS admissionDate,
      a.status,
      a.priority_level AS priorityLevel,
      d.department_name AS departmentName,
      r.room_code AS roomCode,
      b.bed_code AS bedCode,
      doc.doctor_id AS doctorId,
      doc.full_name AS doctorName,
      COALESCE(labStats.labCount, 0) AS labCount,
      COALESCE(labStats.pendingLabCount, 0) AS pendingLabCount,
      labStats.latestLabDate,
      labStats.latestLabStatus,
      COALESCE(rxStats.prescriptionCount, 0) AS prescriptionCount,
      rxStats.latestPrescriptionDate,
      discharge.discharge_id AS dischargeId,
      discharge.discharge_date AS dischargeDate,
      discharge.discharge_condition AS dischargeCondition,
      discharge.payment_status AS paymentStatus
    FROM Admissions a
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    INNER JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    LEFT JOIN MedicalRecords mr ON mr.admission_id = a.admission_id
    OUTER APPLY (
      SELECT COUNT(*) AS labCount,
        COUNT(CASE WHEN lt.status <> N'Đã có kết quả' THEN 1 END) AS pendingLabCount,
        MAX(lt.ordered_date) AS latestLabDate,
        (SELECT TOP 1 lt2.status
         FROM LabTests lt2
         WHERE lt2.record_id = mr.record_id
         ORDER BY lt2.ordered_date DESC) AS latestLabStatus
      FROM LabTests lt
      WHERE lt.record_id = mr.record_id
    ) labStats
    OUTER APPLY (
      SELECT COUNT(*) AS prescriptionCount,
        MAX(pr.start_date) AS latestPrescriptionDate
      FROM Prescriptions pr
      WHERE pr.record_id = mr.record_id
    ) rxStats
    OUTER APPLY (
      SELECT TOP 1 dsc.discharge_id, dsc.discharge_date, dsc.discharge_condition, dsc.payment_status
      FROM Discharges dsc
      WHERE dsc.admission_id = a.admission_id
      ORDER BY dsc.discharge_date DESC, dsc.discharge_id DESC
    ) discharge
    WHERE a.status NOT IN (N'Đã hủy', N'Đã xuất viện')
      ${whereDoctor}
    ORDER BY
      CASE WHEN a.status = N'Chờ xuất viện' THEN 0 ELSE 1 END,
      CASE a.priority_level WHEN N'Nguy cấp' THEN 0 WHEN N'Cao' THEN 1 WHEN N'Trung bình' THEN 2 ELSE 3 END,
      a.admission_date DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function getActiveMedicalRecords(doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';

  return query(`
    SELECT mr.record_id AS recordId, mr.record_code AS recordCode,
      p.patient_code AS patientCode, p.full_name AS patientName,
      d.department_name AS departmentName, a.doctor_id AS doctorId,
      doc.full_name AS doctorName
    FROM MedicalRecords mr
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    WHERE a.status IN (N'Đang điều trị', N'Theo dõi', N'Ổn định', N'Chờ xuất viện')
      ${whereDoctor}
    ORDER BY a.admission_date DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function getClinicalOrderRecords(doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';

  return query(`
    SELECT mr.record_id AS recordId, mr.record_code AS recordCode, p.full_name AS patientName,
      p.patient_code AS patientCode, mr.diagnosis_on_admission AS diagnosis,
      mr.vital_signs AS vitalSigns, mr.doctor_notes AS doctorNotes, mr.status, mr.created_at AS createdAt,
      a.admission_id AS admissionId, a.admission_date AS admissionDate, a.status AS admissionStatus,
      d.department_name AS departmentName, r.room_code AS roomCode, b.bed_code AS bedCode,
      doc.full_name AS doctorName,
      CASE WHEN a.status = N'Đã khám' THEN N'Đã khám' ELSE N'Đã nhập viện' END AS clinicalSource
    FROM MedicalRecords mr
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Doctors doc ON doc.doctor_id = a.doctor_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    WHERE a.status IN (N'Đã khám', N'Chờ xếp giường', N'Đang điều trị', N'Theo dõi', N'Ổn định', N'Chờ xuất viện')
      ${whereDoctor}
    ORDER BY
      CASE WHEN a.status = N'Đã khám' THEN 0 ELSE 1 END,
      a.admission_date DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function ensureExamMedicalRecordsForCompletedAppointments(doctorId = null) {
  const whereDoctor = doctorId ? 'AND doctor_id = @doctorId' : '';

  await execute(`
    DECLARE @AppointmentCode VARCHAR(40);
    DECLARE @PatientId INT;
    DECLARE @DepartmentId INT;
    DECLARE @AppointmentDoctorId INT;
    DECLARE @AppointmentTime DATETIME2;
    DECLARE @Reason NVARCHAR(500);
    DECLARE @AdmissionId INT;
    DECLARE @RecordCode VARCHAR(40);

    DECLARE completedAppointments CURSOR LOCAL FAST_FORWARD FOR
      SELECT appointment_code, patient_id, department_id, doctor_id, appointment_time, reason
      FROM Appointments
      WHERE status = N'Đã khám'
        AND patient_id IS NOT NULL
        AND department_id IS NOT NULL
        AND doctor_id IS NOT NULL
        ${whereDoctor};

    OPEN completedAppointments;
    FETCH NEXT FROM completedAppointments
      INTO @AppointmentCode, @PatientId, @DepartmentId, @AppointmentDoctorId, @AppointmentTime, @Reason;

    WHILE @@FETCH_STATUS = 0
    BEGIN
      SET @RecordCode = CONCAT('HSK', @AppointmentCode);

      IF NOT EXISTS (SELECT 1 FROM MedicalRecords WHERE record_code = @RecordCode)
      BEGIN
        INSERT INTO Admissions (
          patient_id, department_id, doctor_id, admission_date, initial_diagnosis,
          initial_condition, status, priority_level
        )
        VALUES (
          @PatientId, @DepartmentId, @AppointmentDoctorId, COALESCE(@AppointmentTime, SYSDATETIME()),
          COALESCE(NULLIF(@Reason, N''), N'Khám bệnh'),
          N'Đã khám, chờ chỉ định cận lâm sàng hoặc hướng xử trí',
          N'Đã khám',
          N'Trung bình'
        );

        SET @AdmissionId = SCOPE_IDENTITY();

        INSERT INTO MedicalRecords (
          record_code, patient_id, admission_id, diagnosis_on_admission, medical_history,
          allergies, vital_signs, doctor_notes, status
        )
        VALUES (
          @RecordCode, @PatientId, @AdmissionId,
          COALESCE(NULLIF(@Reason, N''), N'Khám bệnh'),
          N'Chưa ghi nhận', N'Chưa ghi nhận',
          N'Mạch: --; Huyết áp: --; Nhiệt độ: --; SpO2: --',
          N'Hồ sơ được mở sau khi bác sĩ hoàn tất khám.',
          N'Đã khám'
        );
      END;

      FETCH NEXT FROM completedAppointments
        INTO @AppointmentCode, @PatientId, @DepartmentId, @AppointmentDoctorId, @AppointmentTime, @Reason;
    END;

    CLOSE completedAppointments;
    DEALLOCATE completedAppointments;
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function createPrescription(data, enforcedDoctorId = null) {
  const toArray = (value) => Array.isArray(value) ? value : [value];
  const medicineNames = toArray(data.medicineName).filter((value) => value);
  const dosages = toArray(data.dosage);
  const frequencies = toArray(data.frequency);
  const routes = toArray(data.route);
  const quantities = toArray(data.quantity);
  const units = toArray(data.unit);
  const startDates = toArray(data.startDate);
  const endDates = toArray(data.endDate);
  const itemNotes = toArray(data.itemNote || []);
  const medicines = medicineNames.map((medicineName, index) => ({
    medicineName,
    dosage: dosages[index] || '-',
    frequency: frequencies[index] || '',
    route: routes[index] || '',
    quantity: Math.max(Number(quantities[index] || 1), 1),
    unit: units[index] || 'viên',
    startDate: startDates[index] ? new Date(startDates[index]) : new Date(),
    endDate: endDates[index] ? new Date(endDates[index]) : (startDates[index] ? new Date(startDates[index]) : new Date()),
    note: itemNotes[index] || ''
  })).filter((item) => item.medicineName && item.frequency && item.route);

  if (!medicines.length) {
    throw new Error('Vui lòng nhập ít nhất một thuốc trong đơn.');
  }

  const startDate = new Date(Math.min(...medicines.map((item) => item.startDate.getTime())));
  const endDate = new Date(Math.max(...medicines.map((item) => item.endDate.getTime())));
  const itemNoteText = medicines
    .filter((item) => item.note)
    .map((item) => `${item.medicineName}: ${item.note}`)
    .join('; ');
  const prescriptionNote = [data.note || '', itemNoteText].filter(Boolean).join('; ');
  const doctorId = enforcedDoctorId ? Number(enforcedDoctorId) : Number(data.doctorId);

  await withTransaction(async (tx) => {
    const rows = await tx.query(`
    DECLARE @prescriptionId INT;

    IF NOT EXISTS (
      SELECT 1
      FROM MedicalRecords mr
      INNER JOIN Admissions a ON a.admission_id = mr.admission_id
      WHERE mr.record_id = @recordId AND a.doctor_id = @doctorId
    )
    BEGIN
      THROW 51001, N'Bác sĩ không phụ trách hồ sơ bệnh án này.', 1;
    END;

    INSERT INTO Prescriptions (
      prescription_code, record_id, doctor_id, start_date, end_date, note
    )
    VALUES (
      CONCAT('DT', FORMAT(GETDATE(), 'yyMMddHHmmss')),
      @recordId, @doctorId, @startDate, @endDate, NULLIF(@note, '')
    );

    SET @prescriptionId = SCOPE_IDENTITY();

    SELECT @prescriptionId AS prescriptionId;
  `, {
    recordId: Number(data.recordId),
    doctorId,
    startDate,
    endDate,
    note: prescriptionNote
  });

    const prescriptionId = rows[0] ? rows[0].prescriptionId : null;
    if (!prescriptionId) {
      throw new Error('Không tạo được đơn thuốc.');
    }

    for (const item of medicines) {
      await tx.execute(`
      INSERT INTO PrescriptionItems (
        prescription_id, medicine_name, dosage, frequency, route, quantity, unit
      )
      VALUES (
        @prescriptionId, @medicineName, @dosage, @frequency, @route, @quantity, @unit
      );
    `, {
      prescriptionId,
      medicineName: item.medicineName,
      dosage: item.dosage,
      frequency: item.frequency,
      route: item.route,
      quantity: item.quantity,
      unit: item.unit
    });
    }
  });

  await treatmentCostRepository.recordLatestPrescriptionCosts(data.recordId);
}

async function getLabTests(doctorId = null) {
  await treatmentCostRepository.syncExistingTreatmentCosts();

  const whereDoctor = doctorId ? 'WHERE lt.doctor_id = @doctorId' : '';

  const rows = await query(`
    SELECT lt.test_code AS testCode, mr.record_id AS recordId, p.patient_code AS patientCode,
      p.full_name AS patientName, p.date_of_birth AS dateOfBirth, p.gender, p.phone,
      COALESCE(NULLIF(mr.diagnosis_on_admission, N''), a.initial_diagnosis) AS preliminaryDiagnosis,
      lt.test_type AS testType,
      lt.ordered_date AS orderedDate, lt.status, lt.result_summary AS resultSummary,
      lt.result_files AS resultFilesJson,
      doc.full_name AS doctorName, d.department_name AS departmentName,
      labCost.status AS labCostStatus
    FROM LabTests lt
    INNER JOIN MedicalRecords mr ON mr.record_id = lt.record_id
    INNER JOIN Patients p ON p.patient_id = mr.patient_id
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    INNER JOIN Departments d ON d.department_id = a.department_id
    INNER JOIN Doctors doc ON doc.doctor_id = lt.doctor_id
    OUTER APPLY (
      SELECT TOP 1 status
      FROM TreatmentCosts
      WHERE source_type = N'LAB'
        AND source_id = lt.lab_test_id
      ORDER BY cost_id DESC
    ) labCost
    ${whereDoctor}
    ORDER BY lt.ordered_date DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});

  return rows.map((row) => {
    let resultFiles = [];
    try {
      resultFiles = row.resultFilesJson ? JSON.parse(row.resultFilesJson) : [];
    } catch (error) {
      resultFiles = [];
    }

    return {
      ...row,
      resultFiles
    };
  });
}

async function getLabTestByCode(testCode) {
  const rows = await query(`
    SELECT test_code AS testCode, result_files AS resultFilesJson
    FROM LabTests
    WHERE test_code = @testCode
  `, { testCode });

  return rows[0] || null;
}

async function updateLabTestResult(testCode, status, resultSummary, resultFiles = null, doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';
  const params = {
    testCode,
    status,
    resultSummary,
    resultFiles: resultFiles ? JSON.stringify(resultFiles) : null
  };
  if (doctorId) params.doctorId = Number(doctorId);

  await execute(`
    UPDATE lt
    SET lt.status = @status,
        lt.result_summary = @resultSummary,
        lt.result_files = COALESCE(@resultFiles, lt.result_files)
    FROM LabTests lt
    INNER JOIN MedicalRecords mr ON mr.record_id = lt.record_id
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    WHERE lt.test_code = @testCode
      ${whereDoctor};

    IF @@ROWCOUNT = 0
    BEGIN
      THROW 51013, N'Không tìm thấy chỉ định thuộc phạm vi phụ trách.', 1;
    END;
  `, params);

  if (status === 'Đã có kết quả' || status === 'Hoàn thành') {
    await treatmentCostRepository.markLabPerformed(testCode, '');
  }
}

async function confirmLabCostPerformed(testCode, recordedBy = '') {
  return treatmentCostRepository.markLabPerformed(testCode, recordedBy);
}

async function createLabTest(data, enforcedDoctorId = null) {
  const params = {
    recordId: Number(data.recordId),
    testType: data.testType,
    doctorId: enforcedDoctorId ? Number(enforcedDoctorId) : null
  };

  await execute(`
    DECLARE @AssignedDoctorId INT;

    SELECT @AssignedDoctorId = a.doctor_id
    FROM MedicalRecords mr
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    WHERE mr.record_id = @recordId
      ${enforcedDoctorId ? 'AND a.doctor_id = @doctorId' : ''};

    IF @AssignedDoctorId IS NULL
    BEGIN
      THROW 51004, N'Không tìm thấy hồ sơ bệnh án phù hợp để tạo chỉ định xét nghiệm.', 1;
    END;

    INSERT INTO LabTests (
      test_code, record_id, doctor_id, test_type, ordered_date, status, result_summary
    )
    VALUES (
      CONCAT('XN', FORMAT(SYSDATETIME(), 'yyMMddHHmmssfff')),
      @recordId,
      @AssignedDoctorId,
      @testType,
      SYSDATETIME(),
      N'Chờ kết quả',
      NULL
    );
  `, params);

  const rows = await query(`
    SELECT TOP 1 test_code AS testCode
    FROM LabTests
    WHERE record_id = @recordId
    ORDER BY lab_test_id DESC
  `, { recordId: Number(data.recordId) });

  if (rows[0]) {
    await treatmentCostRepository.recordLabOrderCost(rows[0].testCode);
  }
}

async function getBilling() {
  return query(`
    SELECT r.receipt_id AS billingId, r.admission_id AS admissionId, r.receipt_code AS billCode,
      p.full_name AS patientName, 0 AS consultationFee,
      0 AS bedFee, 0 AS medicineFee, 0 AS labFee,
      0 AS insuranceCovered, r.total_amount AS totalAmount, r.payment_status AS paymentStatus
    FROM InpatientReceipts r
    INNER JOIN Admissions a ON a.admission_id = r.admission_id
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    ORDER BY r.created_at DESC
  `);
}

async function createBilling(data) {
  return treatmentCostRepository.createReceipt(data, data.cashierUserId || 1);
}

async function getDischarges(doctorId = null, filters = {}) {
  await treatmentCostRepository.syncExistingTreatmentCosts();

  let whereClause = doctorId ? 'WHERE a.doctor_id = @doctorId' : 'WHERE 1=1';
  const params = doctorId ? { doctorId: Number(doctorId) } : {};

  if (filters.startDate) {
    whereClause += " AND d.discharge_date >= @startDate";
    params.startDate = filters.startDate;
  }
  if (filters.endDate) {
    whereClause += " AND d.discharge_date <= @endDate";
    params.endDate = filters.endDate + ' 23:59:59';
  }

  return query(`
    SELECT d.discharge_id AS dischargeId, p.patient_code AS patientCode, p.full_name AS patientName, 
      d.discharge_condition AS dischargeCondition, d.discharge_date AS dischargeDate, 
      d.treatment_summary AS treatmentSummary,
      ISNULL(costStats.totalCost, 0) AS totalCost,
      CASE
        WHEN ISNULL(costStats.totalCost, 0) = 0 THEN N'Chưa phát sinh'
        WHEN ISNULL(receiptStats.paidAmount, 0) >= ISNULL(costStats.totalCost, 0) THEN N'Đã thanh toán'
        WHEN ISNULL(receiptStats.paidAmount, 0) > 0 THEN N'Một phần'
        ELSE N'Chưa thanh toán'
      END AS paymentStatus,
      (SELECT TOP 1 record_id FROM MedicalRecords WHERE admission_id = a.admission_id) AS recordId
    FROM Discharges d
    INNER JOIN Admissions a ON a.admission_id = d.admission_id
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    OUTER APPLY (
      SELECT SUM(amount) AS totalCost
      FROM TreatmentCosts
      WHERE admission_id = a.admission_id
    ) costStats
    OUTER APPLY (
      SELECT SUM(paid_amount) AS paidAmount
      FROM InpatientReceipts
      WHERE admission_id = a.admission_id
    ) receiptStats
    ${whereClause}
    ORDER BY d.discharge_date DESC
  `, params);
}

async function createDischarge(data, doctorId = null) {
  const dischargeDate = data.dischargeDate ? new Date(data.dischargeDate) : new Date();
  const whereDoctor = doctorId ? 'AND doctor_id = @doctorId' : '';
  const params = {
    admissionId: Number(data.admissionId),
    dischargeCondition: data.dischargeCondition,
    dischargeDate,
    treatmentSummary: data.treatmentSummary,
    paymentStatus: data.paymentStatus || 'ChÆ°a thanh toÃ¡n'
  };
  if (doctorId) params.doctorId = Number(doctorId);

  await execute(`
    DECLARE @totalCost DECIMAL(18,2);

    SELECT @totalCost = ISNULL(SUM(amount), 0)
    FROM TreatmentCosts
    WHERE admission_id = @admissionId;

    IF NOT EXISTS (
      SELECT 1 FROM Admissions
      WHERE admission_id = @admissionId ${whereDoctor}
        AND room_id IS NOT NULL
        AND bed_id IS NOT NULL
    )
    BEGIN
      THROW 51002, N'Chỉ được ra viện khi điều dưỡng đã xếp buồng/giường cho bệnh nhân.', 1;
    END;

    INSERT INTO Discharges (
      admission_id, discharge_condition, discharge_date, treatment_summary,
      total_cost, payment_status
    )
    VALUES (
      @admissionId, @dischargeCondition, @dischargeDate, @treatmentSummary,
      @totalCost, @paymentStatus
    );

    UPDATE Admissions
    SET status = N'Chờ xuất viện'
    WHERE admission_id = @admissionId;
  `, params);
}

async function createTransferDisposition(data, doctorId = null) {
  const transferDate = data.transferDate ? new Date(data.transferDate) : new Date();
  const whereDoctor = doctorId ? 'AND doctor_id = @doctorId' : '';
  const params = {
    admissionId: Number(data.admissionId),
    transferDate,
    transferHospital: data.transferHospital || '',
    transferReason: data.transferReason || '',
    treatmentSummary: data.treatmentSummary || '',
    paymentStatus: data.paymentStatus || 'Chưa thanh toán'
  };
  if (doctorId) params.doctorId = Number(doctorId);

  await execute(`
    DECLARE @totalCost DECIMAL(18,2);
    DECLARE @condition NVARCHAR(500);
    DECLARE @summary NVARCHAR(1000);

    SELECT @totalCost = ISNULL(SUM(amount), 0)
    FROM TreatmentCosts
    WHERE admission_id = @admissionId;

    IF NOT EXISTS (
      SELECT 1 FROM Admissions
      WHERE admission_id = @admissionId ${whereDoctor}
        AND room_id IS NOT NULL
        AND bed_id IS NOT NULL
    )
    BEGIN
      THROW 51005, N'Chỉ được chuyển viện khi điều dưỡng đã xếp buồng/giường cho bệnh nhân.', 1;
    END;

    IF EXISTS (SELECT 1 FROM Discharges WHERE admission_id = @admissionId)
    BEGIN
      THROW 51006, N'Lượt điều trị này đã có hồ sơ ra viện/chuyển viện.', 1;
    END;

    SET @condition = CONCAT(N'Chuyển viện', CASE WHEN NULLIF(@transferHospital, N'') IS NULL THEN N'' ELSE CONCAT(N' đến ', @transferHospital) END);
    SET @summary = CONCAT(
      NULLIF(@treatmentSummary, N''),
      CASE WHEN NULLIF(@transferReason, N'') IS NULL THEN N'' ELSE CONCAT(CHAR(13), CHAR(10), N'Lý do chuyển viện: ', @transferReason) END
    );

    INSERT INTO Discharges (
      admission_id, discharge_condition, discharge_date, treatment_summary,
      total_cost, payment_status
    )
    VALUES (
      @admissionId,
      @condition,
      @transferDate,
      COALESCE(NULLIF(@summary, N''), N'Chuyển tuyến theo chỉ định chuyên môn.'),
      @totalCost,
      @paymentStatus
    );

    UPDATE Admissions
    SET status = N'Chờ xuất viện'
    WHERE admission_id = @admissionId;

    UPDATE MedicalRecords
    SET status = N'Chờ xuất viện',
        updated_at = SYSDATETIME()
    WHERE admission_id = @admissionId;
  `, params);
}

async function getUsers() {
  return query(`
    SELECT u.user_id AS userId, u.username, u.email, u.full_name AS fullName,
      r.role_name AS roleName, r.role_code AS roleCode, u.status, u.created_at AS createdAt
    FROM Users u
    INNER JOIN Roles r ON r.role_id = u.role_id
    ORDER BY u.created_at DESC
  `);
}

async function getBHYTList() {
  return query(`
    SELECT p.patient_id AS patientId, p.patient_code AS patientCode, p.full_name AS fullName,
      p.health_insurance_no AS insuranceNo, p.phone, p.identity_number AS identityNumber,
      a.admission_id AS admissionId, a.status AS admissionStatus, d.department_name AS departmentName,
      (SELECT SUM(amount) FROM TreatmentCosts WHERE admission_id = a.admission_id) AS totalBill,
      0 AS totalCovered
    FROM Patients p
    LEFT JOIN Admissions a ON a.patient_id = p.patient_id AND a.status <> N'Đã xuất viện' AND a.status <> N'Đã hủy'
    LEFT JOIN Departments d ON d.department_id = a.department_id
    WHERE p.health_insurance_no IS NOT NULL OR a.admission_id IS NOT NULL
    ORDER BY p.created_at DESC
  `);
}

async function getLengthOfStay(doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';

  return query(`
    SELECT p.patient_code AS patientCode, p.full_name AS patientName,
      a.admission_date AS admissionDate, d.department_name AS departmentName,
      r.room_code AS roomCode, b.bed_code AS bedCode,
      DATEDIFF(DAY, a.admission_date, GETDATE()) AS daysStayed,
      a.status
    FROM Admissions a
    INNER JOIN Patients p ON p.patient_id = a.patient_id
    LEFT JOIN Departments d ON d.department_id = a.department_id
    LEFT JOIN Rooms r ON r.room_id = a.room_id
    LEFT JOIN Beds b ON b.bed_id = a.bed_id
    WHERE a.status NOT IN (N'Đã xuất viện', N'Đã hủy')
    ${whereDoctor}
    ORDER BY daysStayed DESC
  `, doctorId ? { doctorId: Number(doctorId) } : {});
}

async function updateDischargePayment(dischargeId, paymentStatus) {
  return Promise.resolve({ dischargeId: Number(dischargeId), paymentStatus });
}

async function updateNurseVitals(admissionId, vitals, doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';
  const params = { admissionId: Number(admissionId), vitals };
  if (doctorId) params.doctorId = Number(doctorId);

  return execute(`
    UPDATE mr
    SET mr.vital_signs = @vitals,
        mr.updated_at = SYSDATETIME()
    FROM MedicalRecords mr
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    WHERE mr.admission_id = @admissionId
      ${whereDoctor};

    IF @@ROWCOUNT = 0
    BEGIN
      THROW 51011, N'Không tìm thấy bệnh nhân thuộc phạm vi phụ trách.', 1;
    END;
  `, params);
}

async function updateNurseNotes(admissionId, notes, doctorId = null) {
  const whereDoctor = doctorId ? 'AND a.doctor_id = @doctorId' : '';
  const params = {
    admissionId: Number(admissionId),
    notes: `${new Date().toLocaleString()}: ${notes}`
  };
  if (doctorId) params.doctorId = Number(doctorId);

  return execute(`
    UPDATE mr
    SET mr.doctor_notes = CONCAT(ISNULL(mr.doctor_notes, ''), CHAR(13), CHAR(10), @notes),
        mr.updated_at = SYSDATETIME()
    FROM MedicalRecords mr
    INNER JOIN Admissions a ON a.admission_id = mr.admission_id
    WHERE mr.admission_id = @admissionId
      ${whereDoctor};

    IF @@ROWCOUNT = 0
    BEGIN
      THROW 51012, N'Không tìm thấy bệnh nhân thuộc phạm vi phụ trách.', 1;
    END;
  `, params);
}

async function updateBedStatus(bedId, status, departmentId = null) {
  const whereDepartment = departmentId ? 'AND r.department_id = @departmentId' : '';
  const params = { bedId: Number(bedId), status };
  if (departmentId) params.departmentId = Number(departmentId);

  return execute(`
    UPDATE b
    SET b.status = @status
    FROM Beds b
    INNER JOIN Rooms r ON r.room_id = b.room_id
    WHERE b.bed_id = @bedId
      ${whereDepartment};

    IF @@ROWCOUNT = 0
    BEGIN
      THROW 51015, N'Không tìm thấy giường thuộc khoa phụ trách.', 1;
    END;
  `, params);
}

async function updateRoomBedStatus(roomId, status, departmentId = null) {
  const whereDepartment = departmentId ? 'AND r.department_id = @departmentId' : '';
  const params = {
    roomId: Number(roomId),
    status
  };
  if (departmentId) params.departmentId = Number(departmentId);

  return execute(`
    IF NOT EXISTS (
      SELECT 1
      FROM Rooms r
      WHERE r.room_id = @roomId
        ${whereDepartment}
    )
    BEGIN
      THROW 51022, N'Không tìm thấy phòng thuộc khoa phụ trách.', 1;
    END;

    UPDATE b
    SET b.status = @status
    FROM Beds b
    INNER JOIN Rooms r ON r.room_id = b.room_id
    WHERE r.room_id = @roomId
      ${whereDepartment}
      AND NOT EXISTS (
        SELECT 1
        FROM Admissions a
        WHERE a.bed_id = b.bed_id
          AND a.status IN (N'Chờ xếp giường', N'Đang điều trị', N'Theo dõi', N'Ổn định', N'Chờ xuất viện')
      );

    UPDATE r
    SET r.status = @status
    FROM Rooms r
    WHERE r.room_id = @roomId
      ${whereDepartment};
  `, params);
}

async function getDoctorDuties() {
  return query(`
    SELECT d.doctor_id AS doctorId, d.doctor_code AS doctorCode, d.full_name AS fullName,
      d.specialty, d.shift_name AS shiftName, d.department_id AS departmentId, dept.department_name AS departmentName,
      (SELECT COUNT(*) FROM Admissions WHERE doctor_id = d.doctor_id AND status = N'Đang điều trị') AS activePatients
    FROM Doctors d
    LEFT JOIN Departments dept ON dept.department_id = d.department_id
    ORDER BY dept.department_name, d.full_name
  `);
}

async function getDutyShiftStats() {
  return query(`
    SELECT
      COALESCE(NULLIF(shift_name, ''), N'Chưa phân ca') AS shiftName,
      COUNT(DISTINCT Doctors.doctor_id) AS doctorCount,
      COUNT(DISTINCT CASE WHEN Doctors.department_id IS NULL THEN Doctors.doctor_id END) AS unassignedDepartmentCount,
      COUNT(a.admission_id) AS activePatients
    FROM Doctors
    LEFT JOIN Admissions a ON a.doctor_id = Doctors.doctor_id AND a.status = N'Đang điều trị'
    GROUP BY COALESCE(NULLIF(shift_name, ''), N'Chưa phân ca')
    ORDER BY
      CASE COALESCE(NULLIF(shift_name, ''), N'Chưa phân ca')
        WHEN N'Ca Sáng' THEN 1
        WHEN N'Ca Chiều' THEN 2
        WHEN N'Ca Đêm' THEN 3
        WHEN N'Chưa phân ca' THEN 9
        ELSE 4
      END,
      shiftName
  `);
}

async function getStaffPerformance() {
  return query(`
    SELECT u.user_id AS userId, u.full_name AS fullName, r.role_name AS roleName,
      CASE 
        WHEN r.role_code = 'DOCTOR' THEN (
          SELECT COUNT(*) 
          FROM MedicalRecords mr 
          INNER JOIN Admissions a ON a.admission_id = mr.admission_id 
          INNER JOIN Doctors d ON d.doctor_id = a.doctor_id
          WHERE d.full_name = u.full_name
        )
        WHEN r.role_code = 'RECEPTIONIST' THEN (
          SELECT COUNT(*) FROM Admissions WHERE created_at >= DATEADD(MONTH, -1, GETDATE())
        )
        ELSE 0
      END AS totalTasks,
      u.status
    FROM Users u
    INNER JOIN Roles r ON r.role_id = u.role_id
    WHERE r.role_code <> 'PATIENT'
    ORDER BY totalTasks DESC
  `);
}

async function updateDoctorDuty(doctorId, data) {
  return execute(`
    UPDATE Doctors
    SET department_id = @departmentId,
        shift_name = @shiftName
    WHERE doctor_id = @doctorId
  `, {
    doctorId: Number(doctorId),
    departmentId: data.departmentId ? Number(data.departmentId) : null,
    shiftName: data.shiftName || null
  });
}

async function removeDoctorDuty(doctorId) {
  return execute(`
    UPDATE Doctors
    SET department_id = NULL,
        shift_name = NULL
    WHERE doctor_id = @doctorId
  `, { doctorId: Number(doctorId) });
}

async function getInpatientStats() {
  return query(`
    SELECT d.department_name AS departmentName, 
      COUNT(a.admission_id) AS patientCount,
      (SELECT COUNT(*) FROM Beds b INNER JOIN Rooms r ON r.room_id = b.room_id WHERE r.department_id = d.department_id) AS totalBeds
    FROM Departments d
    LEFT JOIN Admissions a ON a.department_id = d.department_id AND a.status = N'Đang điều trị'
    GROUP BY d.department_id, d.department_name
  `);
}

async function getRevenueStats() {
  return query(`
    SELECT FORMAT(created_at, 'yyyy-MM') AS month,
      SUM(paid_amount) AS revenue,
      0 AS insurance
    FROM InpatientReceipts
    GROUP BY FORMAT(created_at, 'yyyy-MM')
    ORDER BY month DESC
  `);
}

async function getVisitStats(filters = {}) {
  let whereClause = "WHERE admission_date >= DATEADD(DAY, -30, GETDATE())";
  const params = {};

  if (filters.startDate || filters.endDate) {
    whereClause = "WHERE 1=1";
    if (filters.startDate) {
      whereClause += " AND admission_date >= @startDate";
      params.startDate = filters.startDate;
    }
    if (filters.endDate) {
      whereClause += " AND admission_date <= @endDate";
      params.endDate = filters.endDate + ' 23:59:59';
    }
  }

  return query(`
    SELECT CAST(admission_date AS date) AS date, COUNT(*) AS visitCount
    FROM Admissions
    ${whereClause}
    GROUP BY CAST(admission_date AS date)
    ORDER BY date DESC
  `, params);
}

async function getMedicineUsageStats() {
  return query(`
    SELECT medicine_name AS medicineName, SUM(quantity) AS totalUsed,
      COUNT(DISTINCT prescription_id) AS prescriptionCount
    FROM PrescriptionItems
    GROUP BY medicine_name
    ORDER BY totalUsed DESC
  `);
}

module.exports = {
  getMedicalRecords,
  completeMedicalRecord,
  getMedicalRecordDetail,
  getDepartmentsOverview,
  getDepartmentDetail,
  getDepartmentRooms,
  getDepartmentBeds,
  getDepartmentPatients,
  getDepartmentStaff,
  createRoom,
  updateRoom,
  deleteRoom,
  createBed,
  updateBed,
  deleteBed,
  getBeds,
  getRoomDetail,
  ensureDepartmentRoomSeed,
  reconcileBedOccupancy,
  getAvailableBeds,
  getActiveAdmissions,
  transferBed,
  requestAdmissionBed,
  getDoctors,
  getTreatmentDoctorsOverview,
  getDoctorByUser,
  getTreatments,
  updateTreatmentStatus,
  getNursingWorklist,
  getPrescriptions,
  getPrescriptionPrintData,
  getFinalActionWorklist,
  getActiveMedicalRecords,
  getClinicalOrderRecords,
  ensureExamMedicalRecordsForCompletedAppointments,
  createPrescription,
  getLabTests,
  getLabTestByCode,
  createLabTest,
  updateLabTestResult,
  confirmLabCostPerformed,
  getBilling,
  createBilling,
  getDischarges,
  createDischarge,
  createTransferDisposition,
  getUsers,
  getBHYTList,
  getLengthOfStay,
  updateDischargePayment,
  updateNurseVitals,
  updateNurseNotes,
  updateBedStatus,
  updateRoomBedStatus,
  getDoctorDuties,
  getDutyShiftStats,
  getStaffPerformance,
  updateDoctorDuty,
  removeDoctorDuty,
  getInpatientStats,
  getRevenueStats,
  getVisitStats,
  getMedicineUsageStats
};
