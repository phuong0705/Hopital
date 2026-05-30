const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'public', 'form-templates', 'source');
fs.mkdirSync(uploadDir, { recursive: true });

const allowedExtensions = new Set(['.pdf', '.doc', '.docx']);
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream'
]);

function safeFileBaseName(value, fallback = 'bieu-mau') {
  return path.basename(value || fallback, path.extname(value || ''))
    .replace(/[^\w-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || fallback;
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const safeBaseName = safeFileBaseName(req.body.templateCode || file.originalname);
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeBaseName}${extension}`);
  }
});

const uploadFormTemplateFile = multer({
  storage,
  limits: {
    files: 1,
    fileSize: 20 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    if (allowedExtensions.has(extension) && allowedMimeTypes.has(file.mimetype)) {
      return callback(null, true);
    }
    return callback(new Error('Chỉ được upload file PDF, DOC hoặc DOCX.'));
  }
});

function uploadFormTemplate(req, res, next) {
  uploadFormTemplateFile.single('templateFile')(req, res, (error) => {
    if (!error) return next();

    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'File biểu mẫu không được vượt quá 20MB.'
      : error.message || 'Không thể upload file biểu mẫu.';

    req.flash('error', message);
    return res.redirect('/nghiep-vu/bieu-mau?activeMenu=admin-form-templates');
  });
}

module.exports = {
  uploadFormTemplate
};
