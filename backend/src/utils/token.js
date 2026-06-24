const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: COOKIE_MAX_AGE });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

module.exports = { COOKIE_NAME, signToken, setAuthCookie, clearAuthCookie };
