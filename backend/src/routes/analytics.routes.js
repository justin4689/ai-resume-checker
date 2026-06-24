const { Router } = require('express');
const requireAuth = require('../middleware/auth.middleware');
const { insights, versions, history } = require('../controllers/analytics.controller');

const router = Router();
router.use(requireAuth);

router.get('/insights', insights);
router.get('/versions', versions);
router.get('/history', history);

module.exports = router;
