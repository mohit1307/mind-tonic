const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

// Allowed file types
const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(__dirname, '..', env.UPLOAD_DIR));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = ALLOWED_TYPES[file.mimetype] || path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type ${file.mimetype} is not allowed. Allowed: ${Object.keys(ALLOWED_TYPES).join(', ')}`, 'INVALID_FILE_TYPE'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
    files: 5, // Max files per request
  },
});

module.exports = upload;
