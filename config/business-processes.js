const businessGroups = [
  {
    key: 'catalog',
    code: '1',
    title: 'Quản lý danh mục',
    icon: 'bi-folder2-open',
    roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    items: [
      { key: 'departments', code: '1.1', title: 'Danh mục khoa/phòng', href: '/departments', icon: 'bi-hospital' },
      { key: 'doctors', code: '1.2', title: 'Danh mục bác sĩ', href: '/doctors', icon: 'bi-person-vcard' },
      { key: 'catalog-diseases', code: '1.3', title: 'Danh mục bệnh', href: '/nghiep-vu/danh-muc-benh', icon: 'bi-virus' },
      { key: 'catalog-medicines', code: '1.4', title: 'Danh mục thuốc', href: '/nghiep-vu/danh-muc-thuoc', icon: 'bi-capsule-pill' },
      { key: 'catalog-services', code: '1.5', title: 'Danh mục dịch vụ', href: '/nghiep-vu/danh-muc-dich-vu', icon: 'bi-clipboard2-check' },
      { key: 'beds', code: '1.6', title: 'Danh mục phòng bệnh', href: '/beds', icon: 'bi-layout-sidebar-inset' }
    ]
  },
  {
    key: 'patients-process',
    code: '2',
    title: 'Quản lý bệnh nhân',
    icon: 'bi-people',
    roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    items: [
      { key: 'reception', code: '2.1', title: 'Tiếp nhận bệnh nhân', href: '/patients/reception', icon: 'bi-person-plus' },
      { key: 'medical-records', code: '2.2', title: 'Quản lý HSBA', href: '/medical-records', icon: 'bi-journal-medical' },
      { key: 'patients', code: '2.3', title: 'Quản lý thông tin cá nhân', href: '/patients/list', icon: 'bi-person-lines-fill' },
      { key: 'prescriptions', code: '2.4', title: 'Kê đơn thuốc', href: '/prescriptions', icon: 'bi-prescription2', roles: ['ADMIN', 'DOCTOR'] },
      { key: 'bhyt', code: '2.5', title: 'Quản lý BHYT', href: '/bhyt', icon: 'bi-card-checklist' }
    ]
  },
  {
    key: 'examination',
    code: '3',
    title: 'Quản lý khám bệnh',
    icon: 'bi-clipboard2-pulse',
    roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    items: [
      { key: 'exam-ticket', code: '3.1', title: 'Lập phiếu khám', href: '/nghiep-vu/lap-phieu-kham', icon: 'bi-file-earmark-plus' },
      { key: 'doctor-today-appointments', code: '3.2', title: 'Lịch hẹn hôm nay', href: '/nghiep-vu/lich-hen-kham-hom-nay', icon: 'bi-calendar-check' },
      { key: 'diagnosis', code: '3.3', title: 'Chẩn bệnh', href: '/nghiep-vu/chan-benh', icon: 'bi-activity' },
      { key: 'labtests-order', code: '3.4', title: 'Chỉ định xét nghiệm', href: '/labtests', icon: 'bi-clipboard2-pulse' },
      { key: 'clinical-lookup', code: '3.5', title: 'Tra cứu dữ liệu', href: '/nghiep-vu/tra-cuu-du-lieu-kham', icon: 'bi-database-search' },
      { key: 'exam-results', code: '3.6', title: 'Theo dõi kết quả khám', href: '/nghiep-vu/theo-doi-ket-qua-kham', icon: 'bi-clipboard-data' }
    ]
  },
  {
    key: 'inpatient',
    code: '4',
    title: 'Quản lý nội trú',
    icon: 'bi-building-heart',
    roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    items: [
      { key: 'inpatient-admission', code: '4.1', title: 'Nhập viện', href: '/patients/reception', icon: 'bi-box-arrow-in-right' },
      { key: 'bed-assignment', code: '4.2', title: 'Phân giường/phòng', href: '/beds', icon: 'bi-layout-text-window-reverse' },
      { key: 'length-of-stay', code: '4.3', title: 'Theo dõi thời gian nằm', href: '/nghiep-vu/theo-doi-thoi-gian-nam', icon: 'bi-clock-history' },
      { key: 'discharges', code: '4.4', title: 'Xuất viện', href: '/discharges', icon: 'bi-box-arrow-right', roles: ['ADMIN', 'DOCTOR'] }
    ]
  },
  {
    key: 'treatment-process',
    code: '5',
    title: 'Quản lý điều trị',
    icon: 'bi-heart-pulse',
    roles: ['ADMIN', 'DOCTOR', 'NURSE'],
    items: [
      { key: 'care-plan', code: '5.1', title: 'Lập phác đồ', href: '/nghiep-vu/lap-phac-do', icon: 'bi-diagram-3' },
      { key: 'treatment-prescriptions', code: '5.2', title: 'Kê đơn thuốc', href: '/prescriptions', icon: 'bi-capsule-pill', roles: ['ADMIN', 'DOCTOR'] },
      { key: 'treatments', code: '5.3', title: 'Theo dõi diễn biến', href: '/treatments', icon: 'bi-calendar2-pulse' },
      { key: 'lab-summary', code: '5.4', title: 'Tổng hợp kết quả xét nghiệm', href: '/nghiep-vu/tong-hop-ket-qua-xet-nghiem', icon: 'bi-clipboard-data' }
    ]
  },
  {
    key: 'finance',
    code: '6',
    title: 'Quản lý viện phí',
    icon: 'bi-cash-coin',
    roles: ['ADMIN', 'RECEPTIONIST', 'NURSE'],
    items: [
      { key: 'fee-exam', code: '6.1', title: 'Tính phí khám', href: '/nghiep-vu/tinh-phi-kham', icon: 'bi-calculator' },
      { key: 'fee-inpatient', code: '6.2', title: 'Thu phí nội trú', href: '/billing', icon: 'bi-wallet2' },
      { key: 'invoice', code: '6.3', title: 'Hóa đơn', href: '/nghiep-vu/hoa-don', icon: 'bi-file-text' }
    ]
  },
  {
    key: 'human-resource',
    code: '7',
    title: 'Quản lý nhân sự',
    icon: 'bi-person-badge',
    roles: ['ADMIN'],
    items: [
      { key: 'hr-users', code: '7.1', title: 'Quản lý tài khoản nhân viên', href: '/users', icon: 'bi-shield-lock' },
      { key: 'doctor-duty', code: '7.2', title: 'Phân công bác sĩ trực', href: '/nghiep-vu/quan-ly-bac-si-truc', icon: 'bi-calendar-check' },
      { key: 'duty-shift', code: '7.3', title: 'Quản lý ca trực', href: '/nghiep-vu/quan-ly-ca-truc', icon: 'bi-calendar-week' },
      { key: 'performance', code: '7.4', title: 'Theo dõi hiệu suất', href: '/nghiep-vu/theo-doi-hieu-suat', icon: 'bi-graph-up-arrow' }
    ]
  },
  {
    key: 'reports',
    code: '8',
    title: 'Báo cáo - thống kê',
    icon: 'bi-bar-chart-line',
    roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    items: [
      { key: 'report-statistics', code: '8.1', title: 'Báo cáo thống kê', href: '/reports', icon: 'bi-bar-chart-line' }
    ]
  },
  {
    key: 'system-admin',
    code: '9',
    title: 'Quản trị hệ thống',
    icon: 'bi-gear',
    roles: ['ADMIN'],
    items: [
      { key: 'backup-data', code: '9.1', title: 'Sao lưu dữ liệu', href: '/nghiep-vu/sao-luu-du-lieu', icon: 'bi-cloud-arrow-up' },
      { key: 'restore-data', code: '9.2', title: 'Phục hồi dữ liệu', href: '/nghiep-vu/phuc-hoi-du-lieu', icon: 'bi-cloud-arrow-down' }
    ]
  }
];

const businessItems = businessGroups.flatMap(group =>
  group.items.map(item => ({
    ...item,
    groupKey: group.key,
    groupCode: group.code,
    groupTitle: group.title,
    groupIcon: group.icon,
    roles: item.roles || group.roles,
    slug: item.href.startsWith('/nghiep-vu/') ? item.href.replace('/nghiep-vu/', '') : null
  }))
);

function canAccessBusinessGroup(group, roleCode) {
  return roleCode === 'ADMIN' || group.roles.includes(roleCode);
}

function canAccessBusinessItem(item, roleCode) {
  return roleCode === 'ADMIN' || item.roles.includes(roleCode);
}

module.exports = {
  businessGroups,
  businessItems,
  canAccessBusinessGroup,
  canAccessBusinessItem
};
