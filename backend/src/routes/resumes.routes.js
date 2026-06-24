const { Router } = require('express');
const router = Router();

// TODO: implement resume routes
router.get('/ping', (req, res) => res.json({ ok: true, route: 'resumes' }));

module.exports = router;
