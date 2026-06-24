const { Router } = require('express');
const router = Router();

// TODO: implement analytics routes
router.get('/ping', (req, res) => res.json({ ok: true, route: 'analytics' }));

module.exports = router;
