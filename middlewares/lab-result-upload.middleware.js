const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'lab-results');
fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
]);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const safeBaseName = path.basename(file.originalname || 'lab-result', extension)
      .replace(/[^\w-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'lab-result';
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeBaseName}${extension}`);
  }
});

const uploadLabResultFiles = multer({
  storage,
  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    if (allowedMimeTypes.has(file.mimetype)) return callback(null, true);
    return callback(new Error('Định dạng tệp không được hỗ trợ.'));
  }
});

module.exports = {
  uploadLabResultFiles
};
