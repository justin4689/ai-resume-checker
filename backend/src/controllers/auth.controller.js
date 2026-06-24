const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken, setAuthCookie, clearAuthCookie } = require('../utils/token');
const { formatUser } = require('../utils/format');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    setAuthCookie(res, signToken(user._id));
    res.status(201).json({ user: formatUser(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    setAuthCookie(res, signToken(user._id));
    res.json({ user: formatUser(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
function logout(req, res) {
  clearAuthCookie(res);
  res.json({ ok: true });
}

// GET /api/auth/me
function me(req, res) {
  res.json({ user: formatUser(req.user) });
}

// PATCH /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) {
      const taken = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (taken) return res.status(409).json({ error: 'Email already in use' });
      updates.email = email;
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user: formatUser(user) });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/auth/password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }
    const user = await User.findById(req.user._id);
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me, updateProfile, changePassword };
