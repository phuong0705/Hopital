document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const sidebar = document.getElementById('appSidebar');
  const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
  const sidebarCloseTriggers = document.querySelectorAll('[data-sidebar-close]');

  const setSidebarOpen = (isOpen) => {
    body.classList.toggle('sidebar-open', isOpen);
    sidebarToggle?.setAttribute('aria-expanded', String(isOpen));
  };

  sidebarToggle?.addEventListener('click', () => {
    setSidebarOpen(!body.classList.contains('sidebar-open'));
  });

  sidebarCloseTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => setSidebarOpen(false));
  });

  sidebar?.addEventListener('click', (event) => {
    if (window.innerWidth >= 992) return;
    if (event.target.closest('a.nav-link')) setSidebarOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setSidebarOpen(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) setSidebarOpen(false);
  });

  const cleanupModalState = () => {
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
  };

  document.querySelectorAll('.modal').forEach((modal) => {
    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }

    modal.addEventListener('hidden.bs.modal', cleanupModalState);
  });

  document.addEventListener('click', (event) => {
    const closeTrigger = event.target.closest('[data-bs-dismiss="modal"]');
    if (!closeTrigger) return;

    const modal = closeTrigger.closest('.modal');
    if (!modal) return;

    const instance = bootstrap.Modal.getOrCreateInstance(modal);
    instance.hide();
    setTimeout(cleanupModalState, 180);
  });

  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((element) => {
    new bootstrap.Tooltip(element);
  });

  const syncTransferBeds = (roomSelect, bedSelect) => {
    if (!roomSelect || !bedSelect) return;

    const selectedRoom = roomSelect.value;
    let firstVisible = null;

    Array.from(bedSelect.options).forEach((option) => {
      const match = option.dataset.room === selectedRoom;
      option.hidden = !match;
      option.disabled = !match;
      if (match && !firstVisible) firstVisible = option;
    });

    if (firstVisible && (!bedSelect.value || bedSelect.selectedOptions[0]?.disabled)) {
      bedSelect.value = firstVisible.value;
    }
  };

  setTimeout(() => {
    document.querySelectorAll('.app-alert').forEach((alert) => {
      alert.style.transition = 'opacity .25s ease, transform .25s ease';
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-6px)';
      setTimeout(() => alert.remove(), 300);
    });
  }, 4200);

  const admissionCanvas = document.getElementById('admissionTrendChart');
  if (admissionCanvas) {
    new Chart(admissionCanvas, {
      type: 'line',
      data: {
        labels: JSON.parse(admissionCanvas.dataset.labels || '[]'),
        datasets: [{
          label: 'Ca nhập viện',
          data: JSON.parse(admissionCanvas.dataset.values || '[]'),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, .12)',
          tension: 0.42,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#2563eb'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#edf2f7' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  const departmentCanvas = document.getElementById('departmentChart');
  if (departmentCanvas) {
    new Chart(departmentCanvas, {
      type: 'doughnut',
      data: {
        labels: JSON.parse(departmentCanvas.dataset.labels || '[]'),
        datasets: [{
          data: JSON.parse(departmentCanvas.dataset.values || '[]'),
          backgroundColor: ['#2563eb', '#0f9f9a', '#22a06b', '#f59e0b', '#ef4444', '#7c3aed'],
          borderWidth: 0
        }]
      },
      options: {
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, usePointStyle: true, font: { family: 'Be Vietnam Pro' } }
          }
        }
      }
    });
  }

  const doctorGrid = document.getElementById('doctorGrid');
  if (doctorGrid) {
    const searchInput = document.getElementById('doctorSearch');
    const specialtyFilter = document.getElementById('specialtyFilter');
    const shiftFilter = document.getElementById('shiftFilter');
    const emptyState = document.getElementById('doctorEmptyState');
    const cards = Array.from(doctorGrid.querySelectorAll('.doctor-card'));

    const applyDoctorFilters = () => {
      const keyword = (searchInput?.value || '').trim().toLowerCase();
      const specialty = specialtyFilter?.value || '';
      const shift = shiftFilter?.value || '';
      let visibleCount = 0;

      cards.forEach((card) => {
        const matchesKeyword = !keyword || card.dataset.search.includes(keyword);
        const matchesSpecialty = !specialty || card.dataset.specialty === specialty;
        const matchesShift = !shift || card.dataset.shift === shift;
        const visible = matchesKeyword && matchesSpecialty && matchesShift;

        card.classList.toggle('d-none', !visible);
        if (visible) visibleCount += 1;
      });

      emptyState?.classList.toggle('d-none', visibleCount > 0);
    };

    [searchInput, specialtyFilter, shiftFilter].forEach((control) => {
      control?.addEventListener('input', applyDoctorFilters);
      control?.addEventListener('change', applyDoctorFilters);
    });
  }

  const treatmentList = document.getElementById('treatmentList');
  if (treatmentList) {
    const searchInput = document.getElementById('treatmentSearch');
    const statusFilter = document.getElementById('treatmentStatusFilter');
    const emptyState = document.getElementById('treatmentEmptyState');
    const cards = Array.from(treatmentList.querySelectorAll('.treatment-card'));

    const applyTreatmentFilters = () => {
      const keyword = (searchInput?.value || '').trim().toLowerCase();
      const status = statusFilter?.value || '';
      let visibleCount = 0;

      cards.forEach((card) => {
        const searchText = card.dataset.search || '';
        const matchesKeyword = !keyword || searchText.includes(keyword);
        const matchesStatus = !status || card.dataset.status === status;
        const visible = matchesKeyword && matchesStatus;

        card.classList.toggle('d-none', !visible);
        if (visible) visibleCount += 1;
      });

      emptyState?.classList.toggle('d-none', visibleCount > 0);
    };

    searchInput?.addEventListener('input', applyTreatmentFilters);
    statusFilter?.addEventListener('change', applyTreatmentFilters);
  }

  const treatmentModal = document.getElementById('treatmentModal');
  if (treatmentModal) {
    treatmentModal.addEventListener('show.bs.modal', (event) => {
      const button = event.relatedTarget;
      const scheduleId = button?.dataset.id;
      const form = document.getElementById('treatmentUpdateForm');
      const patient = document.getElementById('modalTreatmentPatient');
      const content = document.getElementById('modalTreatmentContent');
      const status = document.getElementById('modalTreatmentStatus');
      const note = document.getElementById('modalTreatmentNote');

      if (form && scheduleId) form.action = `/treatments/${scheduleId}/status`;
      if (patient) patient.textContent = button?.dataset.patient || '-';
      if (content) content.textContent = button?.dataset.content || '-';
      if (status) status.value = button?.dataset.status || status.options[0]?.value || '';
      if (note) note.value = button?.dataset.note || '';
    });
  }

  const printPatientsBtn = document.getElementById('printPatientsBtn');
  printPatientsBtn?.addEventListener('click', () => window.print());

  const exportPatientsBtn = document.getElementById('exportPatientsBtn');
  exportPatientsBtn?.addEventListener('click', () => {
    const table = document.getElementById(exportPatientsBtn.dataset.table);
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tr'));
    const csv = rows.map((row) => {
      const cells = Array.from(row.querySelectorAll('th, td')).slice(0, -1);
      return cells.map((cell) => {
        const text = cell.innerText.replace(/\s+/g, ' ').trim();
        return `"${text.replace(/"/g, '""')}"`;
      }).join(',');
    }).join('\n');

    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportPatientsBtn.dataset.filename || 'danh-sach.csv';
    link.click();
    URL.revokeObjectURL(url);
  });

  const setModalPatientPreview = (preview, button, fallback) => {
    if (!preview || !button) return;
    const name = button.dataset.patientName || fallback;
    const code = button.dataset.patientCode || '';
    const title = preview.querySelector('strong');
    const subtitle = preview.querySelector('span');

    if (title) title.textContent = name || fallback;
    if (subtitle) subtitle.textContent = code ? `${code} · đã chọn từ danh sách` : 'Đã chọn từ danh sách';
  };

  const updateModal = document.getElementById('updateModal');
  updateModal?.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const admissionId = button?.dataset.admissionId;
    const form = document.getElementById('patientStatusForm');
    const status = document.getElementById('updatePatientStatus');
    const priority = document.getElementById('updatePatientPriority');
    const preview = document.getElementById('updatePatientPreview');

    if (form && admissionId) form.action = `/patients/${admissionId}/status`;
    if (status && button?.dataset.status) status.value = button.dataset.status;
    if (priority && button?.dataset.priority) priority.value = button.dataset.priority;
    setModalPatientPreview(preview, button, 'Bệnh nhân đã chọn');
  });

  const transferModal = document.getElementById('transferModal');
  transferModal?.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const admissionId = button?.dataset.admissionId;
    const select = document.getElementById('transferAdmissionSelect');
    const roomSelect = document.getElementById('transferRoomSelect');
    const bedSelect = document.getElementById('transferBedSelect');
    const preview = document.getElementById('transferPatientPreview');

    if (select && admissionId) select.value = admissionId;
    syncTransferBeds(roomSelect, bedSelect);
    setModalPatientPreview(preview, button, 'Bệnh nhân chuyển phòng');
  });

  const transferRoomSelect = document.getElementById('transferRoomSelect');
  transferRoomSelect?.addEventListener('change', () => {
    syncTransferBeds(transferRoomSelect, document.getElementById('transferBedSelect'));
  });

  const dischargeModal = document.getElementById('dischargeModal');
  dischargeModal?.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const admissionId = button?.dataset.admissionId;
    const select = document.getElementById('dischargeAdmissionSelect');
    const preview = document.getElementById('dischargePatientPreview');
    const dischargeDate = document.getElementById('dischargeDateInput');

    if (select && admissionId) select.value = admissionId;
    if (dischargeDate && !dischargeDate.value) {
      const now = new Date();
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      dischargeDate.value = local.toISOString().slice(0, 16);
    }
    setModalPatientPreview(preview, button, 'Bệnh nhân xuất viện');
  });

  const dischargePaymentModal = document.getElementById('dischargePaymentModal');
  dischargePaymentModal?.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const dischargeId = button?.dataset.id;
    const form = document.getElementById('dischargePaymentForm');
    const status = document.getElementById('dischargePaymentStatus');
    const preview = document.getElementById('dischargePaymentPreview');

    if (form && dischargeId) form.action = `/discharges/${dischargeId}/payment`;
    if (status && button?.dataset.status) status.value = button.dataset.status;
    setModalPatientPreview(preview, button, 'Thanh toán xuất viện');
  });

  const setLocalDateTimeValue = (input) => {
    if (!input || input.value) return;
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    input.value = local.toISOString().slice(0, 16);
  };

  const finalPrescriptionModal = document.getElementById('finalPrescriptionModal');
  finalPrescriptionModal?.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const recordId = button?.dataset.recordId;
    const select = document.getElementById('finalPrescriptionRecordSelect');
    const preview = document.getElementById('finalPrescriptionPreview');

    if (select && recordId) select.value = recordId;
    setModalPatientPreview(preview, button, 'Hồ sơ kê đơn');
  });

  const prescriptionItemList = document.getElementById('prescriptionItemList');
  const medicineSuggestionList = document.getElementById('medicineSuggestionList');
  const medicineSuggestionCache = new Map();
  let medicineSearchTimer = null;

  const updatePrescriptionFrequencies = () => {
    if (!prescriptionItemList) return;
    prescriptionItemList.querySelectorAll('[data-prescription-item]').forEach((card) => {
      const frequencyInput = card.querySelector('input[name="frequency[]"]');
      const selectedTimes = Array.from(card.querySelectorAll('[data-dose-time]:checked')).map((input) => input.value);
      if (frequencyInput) frequencyInput.value = selectedTimes.join(', ');
    });
  };

  const populateMedicineSuggestions = (rows) => {
    if (!medicineSuggestionList) return;
    medicineSuggestionList.innerHTML = '';
    medicineSuggestionCache.clear();

    rows.forEach((row) => {
      medicineSuggestionCache.set(row.medicineName, row);
      const option = document.createElement('option');
      option.value = row.medicineName;
      option.label = [row.medicineCode, row.activeIngredient, row.strength].filter(Boolean).join(' · ');
      medicineSuggestionList.appendChild(option);
    });
  };

  const fetchMedicineSuggestions = (keyword) => {
    clearTimeout(medicineSearchTimer);
    if (!keyword || keyword.trim().length < 2) {
      populateMedicineSuggestions([]);
      return;
    }

    medicineSearchTimer = setTimeout(async () => {
      try {
        const response = await fetch(`/nghiep-vu/tim-thuoc?keyword=${encodeURIComponent(keyword.trim())}`, {
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) return;
        const data = await response.json();
        populateMedicineSuggestions(data.rows || []);
      } catch (error) {
        populateMedicineSuggestions([]);
      }
    }, 220);
  };

  const applyMedicineSuggestion = (input) => {
    const item = medicineSuggestionCache.get(input.value);
    if (!item) return;
    const card = input.closest('[data-prescription-item]');
    const dosageInput = card?.querySelector('input[name="dosage[]"]');
    const routeSelect = card?.querySelector('select[name="route[]"]');
    const unitInput = card?.querySelector('input[name="unit[]"]');

    if (dosageInput) dosageInput.value = item.strength || item.dosageForm || '-';
    if (unitInput && item.unit) unitInput.value = item.unit;
    if (routeSelect && item.route) {
      const routeOption = Array.from(routeSelect.options).find((option) => option.value === item.route);
      if (routeOption) routeSelect.value = item.route;
    }
  };

  const refreshPrescriptionCards = () => {
    if (!prescriptionItemList) return;
    const cards = Array.from(prescriptionItemList.querySelectorAll('[data-prescription-item]'));
    cards.forEach((card, index) => {
      const title = card.querySelector('.prescription-item-title');
      const removeButton = card.querySelector('[data-remove-prescription-item]');
      if (title) title.textContent = `Thuốc ${index + 1}`;
      removeButton?.classList.toggle('d-none', cards.length === 1);
    });
  };

  const addPrescriptionItem = () => {
    if (!prescriptionItemList) return;
    const template = prescriptionItemList.querySelector('[data-prescription-item]');
    if (!template) return;

    const clone = template.cloneNode(true);
    clone.querySelectorAll('input').forEach((input) => {
      input.checked = false;
      input.value = input.type === 'number' ? '1' : (input.name === 'unit[]' ? 'viên' : (input.name === 'dosage[]' ? '-' : ''));
    });
    clone.querySelectorAll('select').forEach((select) => {
      select.selectedIndex = 0;
    });
    prescriptionItemList.appendChild(clone);
    refreshPrescriptionCards();
  };

  const resetPrescriptionItems = () => {
    if (!prescriptionItemList) return;
    const cards = Array.from(prescriptionItemList.querySelectorAll('[data-prescription-item]'));
    cards.slice(1).forEach((card) => card.remove());
    cards[0]?.querySelectorAll('input').forEach((input) => {
      input.checked = false;
      input.value = input.type === 'number' ? '1' : (input.name === 'unit[]' ? 'viên' : (input.name === 'dosage[]' ? '-' : ''));
    });
    cards[0]?.querySelectorAll('select').forEach((select) => {
      select.selectedIndex = 0;
    });
    refreshPrescriptionCards();
  };

  document.getElementById('addPrescriptionItemBelowBtn')?.addEventListener('click', addPrescriptionItem);
  prescriptionItemList?.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-prescription-item]');
    if (!removeButton) return;

    const cards = prescriptionItemList.querySelectorAll('[data-prescription-item]');
    if (cards.length <= 1) return;
    removeButton.closest('[data-prescription-item]')?.remove();
    refreshPrescriptionCards();
  });
  prescriptionItemList?.addEventListener('input', (event) => {
    const medicineInput = event.target.closest('[data-medicine-search]');
    if (medicineInput) {
      fetchMedicineSuggestions(medicineInput.value);
      applyMedicineSuggestion(medicineInput);
      return;
    }

    if (event.target.matches('[data-dose-time]')) {
      updatePrescriptionFrequencies();
    }
  });
  prescriptionItemList?.addEventListener('change', (event) => {
    if (event.target.matches('[data-dose-time]')) {
      updatePrescriptionFrequencies();
      return;
    }

    const medicineInput = event.target.closest('[data-medicine-search]');
    if (medicineInput) applyMedicineSuggestion(medicineInput);
  });
  refreshPrescriptionCards();

  document.getElementById('printPrescriptionTemplateBtn')?.addEventListener('click', () => {
    const form = finalPrescriptionModal?.querySelector('form');
    if (!form) return;

    updatePrescriptionFrequencies();
    const formData = new FormData(form);
    const medicines = formData.getAll('medicineName[]').map((medicineName, index) => ({
      medicineName,
      dosage: formData.getAll('dosage[]')[index] || '',
      frequency: formData.getAll('frequency[]')[index] || '',
      route: formData.getAll('route[]')[index] || '',
      quantity: formData.getAll('quantity[]')[index] || '',
      unit: formData.getAll('unit[]')[index] || '',
      startDate: formData.getAll('startDate[]')[index] || '',
      endDate: formData.getAll('endDate[]')[index] || '',
      note: formData.getAll('itemNote[]')[index] || ''
    })).filter((item) => item.medicineName);

    const payload = {
      recordId: formData.get('recordId'),
      doctorId: formData.get('doctorId'),
      medicines
    };

    window.dispatchEvent(new CustomEvent('prescription-template-print-requested', { detail: payload }));
  });
  finalPrescriptionModal?.addEventListener('hidden.bs.modal', resetPrescriptionItems);
  finalPrescriptionModal?.querySelector('form')?.addEventListener('submit', () => {
    updatePrescriptionFrequencies();
  });

  const finalDischargeModal = document.getElementById('finalDischargeModal');
  finalDischargeModal?.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const admissionId = button?.dataset.admissionId;
    const select = document.getElementById('finalDischargeAdmissionSelect');
    const preview = document.getElementById('finalDischargePreview');
    const dischargeDate = document.getElementById('finalDischargeDateInput');
    const summary = document.getElementById('finalDischargeSummary');

    if (select && admissionId) select.value = admissionId;
    if (summary && button?.dataset.summary && !summary.value) summary.value = button.dataset.summary;
    setLocalDateTimeValue(dischargeDate);
    setModalPatientPreview(preview, button, 'Bệnh nhân ra viện');
  });

  const finalTransferModal = document.getElementById('finalTransferModal');
  finalTransferModal?.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const admissionId = button?.dataset.admissionId;
    const select = document.getElementById('finalTransferAdmissionSelect');
    const preview = document.getElementById('finalTransferPreview');
    const transferDate = document.getElementById('finalTransferDateInput');

    if (select && admissionId) select.value = admissionId;
    setLocalDateTimeValue(transferDate);
    setModalPatientPreview(preview, button, 'Bệnh nhân chuyển viện');
  });

  const normalizeText = (value) => (value || '').toString().trim().toLowerCase();

  const applyModuleFilters = (tableId) => {
    const table = document.getElementById(tableId);
    if (!table) return;

    const searchInput = document.querySelector(`[data-module-search="${tableId}"]`);
    const filters = Array.from(document.querySelectorAll(`[data-module-filter="${tableId}"]`));
    const emptyState = document.querySelector(`[data-empty-for="${tableId}"]`);
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const linkedCards = Array.from(document.querySelectorAll(`[data-table-row="${tableId}"]`));
    const keyword = normalizeText(searchInput?.value);
    let visibleCount = 0;

    rows.forEach((row) => {
      const matchesKeyword = !keyword || normalizeText(row.dataset.search || row.innerText).includes(keyword);
      const matchesFilters = filters.every((filter) => {
        const value = filter.value;
        const key = filter.dataset.filterKey;
        const rowValue = row.dataset[key] || '';
        return !value || rowValue === value || rowValue.split('|').includes(value);
      });
      const visible = matchesKeyword && matchesFilters;

      row.classList.toggle('d-none', !visible);
      if (visible) visibleCount += 1;
    });

    linkedCards.forEach((card) => {
      const matchesKeyword = !keyword || normalizeText(card.dataset.search || card.innerText).includes(keyword);
      const matchesFilters = filters.every((filter) => {
        const value = filter.value;
        const key = filter.dataset.filterKey;
        const cardValue = card.dataset[key] || '';
        return !value || cardValue === value || cardValue.split('|').includes(value);
      });
      const visible = matchesKeyword && matchesFilters;
      card.classList.toggle('d-none', !visible);
      if (visible && linkedCards.length) visibleCount += 1;
    });

    emptyState?.classList.toggle('d-none', visibleCount > 0);
  };

  document.querySelectorAll('[data-module-search]').forEach((input) => {
    input.addEventListener('input', () => applyModuleFilters(input.dataset.moduleSearch));
  });

  document.querySelectorAll('[data-module-filter]').forEach((select) => {
    select.addEventListener('change', () => applyModuleFilters(select.dataset.moduleFilter));
  });

  document.querySelectorAll('[data-export-table]').forEach((button) => {
    button.addEventListener('click', () => {
      const table = document.getElementById(button.dataset.exportTable);
      if (!table) return;

      const rows = Array.from(table.querySelectorAll('tr'));
      const csv = rows.map((row) => {
        const cells = Array.from(row.querySelectorAll('th, td')).filter((cell) => !cell.classList.contains('no-export'));
        return cells.map((cell) => {
          const text = cell.innerText.replace(/\s+/g, ' ').trim();
          return `"${text.replace(/"/g, '""')}"`;
        }).join(',');
      }).join('\n');

      const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = button.dataset.filename || 'du-lieu.csv';
      link.click();
      URL.revokeObjectURL(url);
    });
  });

  document.querySelectorAll('[data-print-page]').forEach((button) => {
    button.addEventListener('click', () => window.print());
  });

  const billingInputs = Array.from(document.querySelectorAll('.billing-input'));
  const billingPreviewTotal = document.getElementById('billingPreviewTotal');
  if (billingInputs.length && billingPreviewTotal) {
    const currencyFormatter = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    });

    const updateBillingPreview = () => {
      const values = Object.fromEntries(billingInputs.map((input) => [input.name, Number(input.value || 0)]));
      const total = Math.max(
        (values.consultationFee || 0) + (values.bedFee || 0) + (values.medicineFee || 0) + (values.labFee || 0) - (values.insuranceCovered || 0),
        0
      );
      billingPreviewTotal.textContent = currencyFormatter.format(total);
    };

    billingInputs.forEach((input) => input.addEventListener('input', updateBillingPreview));
    updateBillingPreview();
  }

  // Auto-open billing modal if admissionId is in URL
  const urlParams = new URLSearchParams(window.location.search);
  const admissionId = urlParams.get('admissionId');
  if (admissionId && window.location.pathname === '/billing') {
    const billingModal = document.getElementById('billingModal');
    if (billingModal) {
      const modal = new bootstrap.Modal(billingModal);
      const select = billingModal.querySelector('select[name="admissionId"]');
      if (select) select.value = admissionId;
      modal.show();
    }
  }
});
