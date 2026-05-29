const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'lab-results');
fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

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
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    if (allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(extension)) {
      return callback(null, true);
    }
    return callback(new Error('Chỉ được upload ảnh jpg, jpeg, png hoặc webp.'));
  }
});

function uploadLabResultImages(req, res, next) {
  uploadLabResultFiles.array('resultFiles', 10)(req, res, (error) => {
    if (!error) return next();

    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Ảnh không được vượt quá 5MB.'
      : error.message || 'Không thể upload ảnh.';

    return res.status(400).json({ error: message });
  });
}

module.exports = {
  uploadLabResultFiles,
  uploadLabResultImages
};
