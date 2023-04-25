var jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
  generateTokenForUser: function (userData) {
    return jwt.sign({
        username: userData.username
      },
      process.env.JWT_SIGN_SECRET, {
        expiresIn: '15s'
      })
  },
  generateRefreshTokenForUser: function (userData) {
    return jwt.sign({
      userId: userData.id,
      username: userData.username
    },
    process.env.JWT_REFRESH_SECRET, {
      expiresIn: '23h'
    });
  }
}
