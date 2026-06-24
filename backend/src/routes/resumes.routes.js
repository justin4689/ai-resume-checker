const { Router } = require('express');
const requireAuth = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');
const {
  list,
  get,
  getVersion,
  upload,
  remove,
  diff,
} = require('../controllers/resumes.controller');

const router = Router();
router.use(requireAuth);

router.get('/', list);
router.post('/', uploadMiddleware.single('file'), upload);
router.get('/:id', get);
router.delete('/:id', remove);
router.get('/:id/versions/:versionId', getVersion);
router.get('/:id/diff', diff);

module.exports = router;
