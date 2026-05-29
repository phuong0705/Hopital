const TYPE_META = {
  success: {
    icon: 'bi-check-circle-fill',
    defaultMessage: 'Thao tác thành công'
  },
  error: {
    icon: 'bi-exclamation-triangle-fill',
    defaultMessage: 'Thao tác thất bại'
  },
  warning: {
    icon: 'bi-info-circle-fill',
    defaultMessage: 'Vui lòng nhập đầy đủ thông tin'
  },
  permission: {
    icon: 'bi-shield-lock-fill',
    defaultMessage: 'Bạn không có quyền thực hiện chức năng này'
  }
};

function normalizeFlashMessage(type, message) {
  const text = String(message || '').trim();
  const lower = text.toLowerCase();

  if (type === 'permission' || lower.includes('không có quyền') || lower.includes('khong co quyen')) {
    return TYPE_META.permission.defaultMessage;
  }

  if (type === 'warning' || lower.includes('vui lòng') || lower.includes('vui long') || lower.includes('đầy đủ')) {
    return TYPE_META.warning.defaultMessage;
  }

  if (type === 'success') {
    if (lower.includes('xóa') || lower.includes('xoá') || lower.includes('xoa')) return 'Xóa thành công';
    if (lower.includes('cập nhật') || lower.includes('cap nhat')) return 'Cập nhật thành công';
    if (lower.includes('thêm') || lower.includes('tạo') || lower.includes('them') || lower.includes('tao')) {
      return 'Thêm mới thành công';
    }
    return text.length <= 70 ? text : TYPE_META.success.defaultMessage;
  }

  if (type === 'error') {
    if (lower.includes('xóa') || lower.includes('xoá') || lower.includes('xoa')) return 'Không thể xóa dữ liệu';
    return text.length <= 70 ? text : TYPE_META.error.defaultMessage;
  }

  return text.length <= 70 ? text : TYPE_META[type]?.defaultMessage || TYPE_META.error.defaultMessage;
}

function buildFlashNotifications(flashGetter) {
  const notifications = [];
  Object.keys(TYPE_META).forEach((type) => {
    const messages = flashGetter(type) || [];
    messages.forEach((message) => {
      notifications.push({
        type,
        icon: TYPE_META[type].icon,
        message: normalizeFlashMessage(type, message)
      });
    });
  });
  return notifications;
}

module.exports = {
  TYPE_META,
  normalizeFlashMessage,
  buildFlashNotifications
};
