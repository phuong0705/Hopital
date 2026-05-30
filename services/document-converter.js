const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function getLibreOfficeCandidates() {
  const candidates = [];
  if (process.env.LIBREOFFICE_PATH) candidates.push(process.env.LIBREOFFICE_PATH);

  if (process.platform === 'win32') {
    candidates.push(
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
      'soffice.exe',
      'soffice'
    );
  } else {
    candidates.push('soffice', 'libreoffice');
  }

  return candidates;
}

function runLibreOffice(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        return reject(error);
      }
      return resolve({ stdout, stderr });
    });
  });
}

async function convertWordToPdf(sourcePath, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
  const beforeFiles = new Set(fs.readdirSync(outputDir).map((file) => file.toLowerCase()));
  const args = [
    '--headless',
    '--convert-to',
    'pdf',
    '--outdir',
    outputDir,
    sourcePath
  ];

  let lastError = null;
  for (const candidate of getLibreOfficeCandidates()) {
    if (path.isAbsolute(candidate) && !fileExists(candidate)) continue;

    try {
      await runLibreOffice(candidate, args);
      const sourceBase = path.basename(sourcePath, path.extname(sourcePath));
      const expectedPdf = path.join(outputDir, `${sourceBase}.pdf`);
      if (fileExists(expectedPdf)) return expectedPdf;

      const generatedPdf = fs.readdirSync(outputDir)
        .find((file) => file.toLowerCase().endsWith('.pdf') && !beforeFiles.has(file.toLowerCase()));
      if (generatedPdf) return path.join(outputDir, generatedPdf);
    } catch (error) {
      lastError = error;
    }
  }

  const error = new Error('Không tìm thấy LibreOffice để chuyển Word sang PDF. Hãy cài LibreOffice hoặc cấu hình LIBREOFFICE_PATH.');
  error.cause = lastError;
  throw error;
}

module.exports = {
  convertWordToPdf
};
