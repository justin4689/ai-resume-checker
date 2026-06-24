const { Router } = require('express');
const router = Router();

// TODO: implement dashboard routes
router.get('/ping', (req, res) => res.json({ ok: true, route: 'dashboard' }));

module.exports = router;
