const { Router } = require('express');
const requireAuth = require('../middleware/auth.middleware');
const {
  register,
  login,
  logout,
  me,
  updateProfile,
  changePassword,
} = require('../controllers/auth.controller');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);
router.patch('/profile', requireAuth, updateProfile);
router.patch('/password', requireAuth, changePassword);

module.exports = router;
