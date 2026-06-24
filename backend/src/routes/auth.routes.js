const { Router } = require('express');
const router = Router();

// TODO: implement auth routes
router.get('/ping', (req, res) => res.json({ ok: true, route: 'auth' }));

module.exports = router;
