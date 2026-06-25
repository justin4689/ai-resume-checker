const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      const err = new Error('Only PDF files are allowed');
      err.status = 415;
      cb(err);
    }
  },
});

module.exports = upload;
