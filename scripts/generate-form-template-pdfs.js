const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'public', 'form-templates');
const tempDir = path.join(rootDir, '.tmp-form-template-html');
const chromeDataDir = path.join(rootDir, '.tmp-chrome-form-pdfs');
const browserCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].filter(Boolean);
const browserPath = browserCandidates.find((candidate) => fs.existsSync(candidate));

const forms = [
  {
    fileName: 'bm-tnnb-01-phieu-tiep-nhan-benh-nhan-noi-tru',
    code: 'BM-TNNB-01',
    recordLabel: 'Số HSBA/Mã NB',
    title: 'PHIẾU TIẾP NHẬN BỆNH NHÂN NỘI TRÚ',
    subtitle: '(Tóm tắt thông tin cần thiết khi tiếp nhận điều trị nội trú)',
    sections: [
      {
        title: 'I. THÔNG TIN NGƯỜI BỆNH',
        rows: [
          ['Họ và tên', '........................................', 'Giới tính', '☐ Nam   ☐ Nữ'],
          ['Ngày sinh', '...... / ...... / ........', 'Tuổi', '........'],
          ['CCCD/CMND', '........................................', 'SĐT', '........................................'],
          ['Địa chỉ', '............................................................................................................................', '', '']
        ]
      },
      {
        title: 'II. NGƯỜI LIÊN HỆ',
        rows: [
          ['Họ tên', '........................................', 'Quan hệ', '........................................'],
          ['SĐT liên hệ', '........................................', 'Người đưa đến', '☐ Tự đến   ☐ Người nhà   ☐ Cấp cứu']
        ]
      },
      {
        title: 'III. THÔNG TIN TIẾP NHẬN',
        rows: [
          ['Thời gian', '...... giờ ...... phút, ngày ...... / ...... / ........', '', ''],
          ['Hình thức', '☐ Khám bệnh   ☐ Cấp cứu   ☐ Chuyển viện   ☐ Tái khám   ☐ Khác: ..............', '', ''],
          ['Lý do vào viện', '............................................................................................................................', '', ''],
          ['Triệu chứng chính', '............................................................................................................................', '', ''],
          ['Tình trạng', '☐ Tỉnh   ☐ Lơ mơ   ☐ Hôn mê   ☐ Đau nhiều   ☐ Khó thở   ☐ Khác: ..............', '', '']
        ]
      },
      {
        title: 'IV. SINH HIỆU BAN ĐẦU',
        rows: [
          ['Mạch', '........ lần/phút   Nhiệt độ: ........ °C   HA: ...... / ...... mmHg   Nhịp thở: ........ lần/phút   SpO₂: ........ %   Cân nặng: ........ kg', '', '']
        ]
      },
      {
        title: 'V. CHẨN ĐOÁN SƠ BỘ VÀ HƯỚNG XỬ TRÍ',
        rows: [
          ['Chẩn đoán sơ bộ', '............................................................................................................................', '', ''],
          ['Hướng xử trí', '☐ Nhập viện   ☐ Chuyển khoa   ☐ Chuyển viện   ☐ Theo dõi   ☐ Khác: ..............', '', ''],
          ['Khoa/Giường', 'Khoa: ........................................', 'Buồng/Giường', 'Buồng: ........   Giường: ........']
        ]
      }
    ],
    signatures: ['Người bệnh/Người nhà', 'Nhân viên tiếp nhận', 'Bác sĩ/Điều dưỡng']
  },
  {
    fileName: 'bm-nt-04-phieu-phan-khoa-buong-giuong',
    code: 'BM-NT-04',
    recordLabel: 'Số phiếu',
    title: 'PHIẾU PHÂN KHOA, BUỒNG, GIƯỜNG',
    sections: [
      {
        title: '1. Thông tin người bệnh',
        rows: [
          ['Họ tên', '........................................', 'Mã NB/Số BA', '........................................'],
          ['Ngày sinh/Tuổi', '........................................', 'Giới tính', '........................................'],
          ['Đối tượng thanh toán', '........................................', 'Thời gian yêu cầu', '........................................']
        ]
      },
      {
        title: '2. Điều phối giường',
        rows: [
          ['Khoa điều trị', '........................................', 'Buồng', '........................................'],
          ['Giường', '........................................', 'Loại giường', '☐ Thường   ☐ Dịch vụ   ☐ Cấp cứu   ☐ Hồi sức'],
          ['Tình trạng giường', '☐ Trống   ☐ Đang chờ   ☐ Cần vệ sinh', '', '........................................']
        ]
      },
      {
        title: '3. Bàn giao',
        rows: [
          ['Người điều phối', '........................................', 'Người nhận khoa', '........................................'],
          ['Thời gian nhận giường', '........................................', 'Ghi chú', '........................................']
        ]
      }
    ],
    signatures: ['Người bệnh/Đại diện', 'Nhân viên phụ trách', 'Bác sĩ/Trưởng khoa']
  },
  {
    fileName: 'bm-nt-05-ho-so-benh-an-noi-tru',
    code: 'BM-NT-05',
    recordLabel: 'Số phiếu',
    title: 'HỒ SƠ BỆNH ÁN NỘI TRÚ',
    sections: [
      {
        title: '1. Hành chính',
        rows: [
          ['Họ tên', '........................................', 'Mã NB/Số BA', '........................................'],
          ['Ngày sinh/Tuổi', '........................................', 'Giới tính', '........................................'],
          ['Khoa/Buồng/Giường', '........................................', 'Ngày vào viện', '........................................']
        ]
      },
      {
        title: '2. Thông tin bệnh án',
        rows: [
          ['Lý do vào viện', '........................................', 'Bệnh sử', '........................................'],
          ['Tiền sử', '........................................', 'Khám lâm sàng chính', '........................................'],
          ['Chẩn đoán vào viện', '........................................', 'Chẩn đoán xác định', '........................................']
        ]
      },
      {
        title: '3. Điều trị',
        rows: [
          ['Hướng điều trị', '........................................', 'Theo dõi đặc biệt', '........................................'],
          ['Bác sĩ điều trị', '........................................', '', '........................................']
        ]
      }
    ],
    signatures: ['Người bệnh/Đại diện', 'Nhân viên phụ trách', 'Bác sĩ/Trưởng khoa']
  }
];

function renderHeader(form) {
  return `
    <table class="top-table">
      <tr>
        <td><strong>CƠ SỞ KCB:</strong> ........................<br><strong>Khoa/Phòng:</strong> ........................</td>
        <td class="center"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>Độc lập - Tự do - Hạnh phúc</td>
        <td class="right"><strong>Mã mẫu:</strong> ${form.code}<br><strong>${form.recordLabel}:</strong> ........................</td>
      </tr>
    </table>
    <h1>${form.title}</h1>
    ${form.subtitle ? `<p class="subtitle">${form.subtitle}</p>` : ''}
  `;
}

function renderSection(section) {
  const rows = section.rows.map((row) => {
    const [label1, value1, label2, value2] = row;
    if (!label2 && !value2) {
      return `<tr><th>${label1}</th><td colspan="3">${value1}</td></tr>`;
    }

    return `<tr><th>${label1}</th><td>${value1}</td><th>${label2 || ''}</th><td>${value2 || ''}</td></tr>`;
  }).join('');

  return `
    <section>
      <h2>${section.title}</h2>
      <table class="form-table">${rows}</table>
    </section>
  `;
}

function renderSignatures(signatures) {
  return `
    <section>
      <h2>Xác nhận</h2>
      <table class="signature-table">
        <tr>${signatures.map((item) => `<th>${item}</th>`).join('')}</tr>
        <tr>${signatures.map(() => '<td>(Ký, ghi rõ họ tên)<br><br><br>..............................</td>').join('')}</tr>
      </table>
      <div class="date-line">Ngày ...... tháng ...... năm ........</div>
    </section>
  `;
}

function renderHtml(form) {
  return `<!doctype html>
  <html lang="vi">
    <head>
      <meta charset="utf-8">
      <style>
        @page { size: A4 landscape; margin: 11mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #111827; font-family: Arial, sans-serif; font-size: 12px; }
        .sheet { width: 100%; }
        table { width: 100%; border-collapse: collapse; }
        .top-table td { border: 1px solid #8a8a8a; padding: 3px 6px; vertical-align: top; }
        .center { text-align: center; }
        .right { text-align: right; }
        h1 { margin: 7px 0 1px; text-align: center; font-size: 24px; letter-spacing: .2px; }
        .subtitle { margin: 0 0 8px; text-align: center; font-style: italic; }
        h2 { margin: 7px 0 0; padding: 2px 6px; border: 1px solid #8a8a8a; border-bottom: 0; font-size: 14px; text-transform: uppercase; }
        .form-table th, .form-table td { border: 1px solid #8a8a8a; padding: 4px 6px; min-height: 22px; vertical-align: middle; }
        .form-table th { width: 25%; text-align: left; background: #f4f4f4; font-weight: 700; }
        .form-table td { width: 25%; }
        .signature-table th, .signature-table td { border: 1px solid #8a8a8a; text-align: center; padding: 5px 6px; }
        .signature-table td { height: 72px; vertical-align: top; }
        .date-line { margin-top: 6px; text-align: right; font-style: italic; }
      </style>
    </head>
    <body>
      <main class="sheet">
        ${renderHeader(form)}
        ${form.sections.map(renderSection).join('')}
        ${renderSignatures(form.signatures)}
      </main>
    </body>
  </html>`;
}

function toFileUrl(filePath) {
  return `file:///${filePath.replace(/\\/g, '/')}`;
}

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(chromeDataDir, { recursive: true });

if (!browserPath) {
  throw new Error('Chromium browser executable not found. Set CHROME_PATH to override.');
}

for (const form of forms) {
  const htmlPath = path.join(tempDir, `${form.fileName}.html`);
  const pdfPath = path.join(outputDir, `${form.fileName}.pdf`);

  fs.writeFileSync(htmlPath, renderHtml(form), 'utf8');
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--no-pdf-header-footer',
    `--user-data-dir=${chromeDataDir}`,
    `--print-to-pdf=${pdfPath}`,
    toFileUrl(htmlPath)
  ];

  try {
    execFileSync(browserPath, args, { stdio: 'inherit' });
  } catch (error) {
    if (!fs.existsSync(pdfPath) || fs.statSync(pdfPath).size === 0) {
      throw error;
    }
  }
}

console.log(`Generated ${forms.length} PDF form templates in ${outputDir}`);
