const cashierRepository = require('../repositories/cashier.repository');

async function appointments(req, res, next) {
  try {
    const [rows, dependencies] = await Promise.all([
      cashierRepository.getAppointments(),
      cashierRepository.getAppointmentDependencies()
    ]);

    return res.render('cashier/appointments', {
      title: 'Đặt lịch hẹn khám',
      activeMenu: 'cashier-appointments',
      rows,
      ...dependencies
    });
  } catch (error) {
    return next(error);
  }
}

async function createAppointment(req, res, next) {
  try {
    await cashierRepository.createAppointment(req.body, req.session.user.userId);
    req.flash('success', 'Đã tạo lịch hẹn khám.');
    return res.redirect('/thu-ngan/dat-lich-hen-kham');
  } catch (error) {
    if ([51031, 51032].includes(error.number)) {
      req.flash('error', error.number === 51031
        ? 'Không tìm thấy hồ sơ bệnh nhân.'
        : 'Chỉ được đặt lịch tái khám cho bệnh nhân đã xuất viện. Bệnh nhân mới cần đi qua tiếp nhận khám.');
      return res.redirect('/thu-ngan/dat-lich-hen-kham');
    }
    return next(error);
  }
}

async function updateAppointmentStatus(req, res, next) {
  try {
    req.flash('error', 'Tài khoản thu ngân không có quyền cập nhật trạng thái lịch hẹn.');
    return res.redirect('/thu-ngan/dat-lich-hen-kham');
  } catch (error) {
    return next(error);
  }
}

async function queue(req, res, next) {
  try {
    const rows = await cashierRepository.getQueue();

    return res.render('cashier/queue', {
      title: 'Quản lý hàng chờ',
      activeMenu: 'cashier-queue',
      rows
    });
  } catch (error) {
    return next(error);
  }
}

async function printDocuments(req, res, next) {
  try {
    const rows = await cashierRepository.getPrintableDocuments();

    return res.render('cashier/print-documents', {
      title: 'In phiếu / Hóa đơn',
      activeMenu: 'cashier-print',
      rows
    });
  } catch (error) {
    return next(error);
  }
}

async function adjustments(req, res, next) {
  try {
    const [rows, bills] = await Promise.all([
      cashierRepository.getAdjustments(),
      cashierRepository.getPrintableDocuments()
    ]);

    return res.render('cashier/adjustments', {
      title: 'Hoàn tiền / Điều chỉnh',
      activeMenu: 'cashier-adjustments',
      rows,
      bills
    });
  } catch (error) {
    return next(error);
  }
}

async function createAdjustment(req, res, next) {
  try {
    await cashierRepository.createAdjustment(req.body, req.session.user.userId);
    req.flash('success', 'Đã ghi nhận điều chỉnh viện phí.');
    return res.redirect('/thu-ngan/hoan-tien-dieu-chinh');
  } catch (error) {
    return next(error);
  }
}

async function shiftReport(req, res, next) {
  try {
    const data = await cashierRepository.getCashierShiftReport();

    return res.render('cashier/shift-report', {
      title: 'Báo cáo thu ngân ca',
      activeMenu: 'cashier-shift-report',
      data
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  appointments,
  createAppointment,
  updateAppointmentStatus,
  queue,
  printDocuments,
  adjustments,
  createAdjustment,
  shiftReport
};
