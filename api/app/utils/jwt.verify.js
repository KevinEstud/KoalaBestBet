var jwt = require('jsonwebtoken');
require('dotenv').config();
const userConnected = (req, res, next) => {
  if (!req.headers['authorization']) return res.status(401).json({
    error: "Token Manquant !"
  })
  if (req.headers['authorization'].split(' ')[1] == null) return res.status(401).json({
    error: "Token Manquant !"
  })

  jwt.verify(req.headers['authorization'].split(' ')[1], process.env.JWT_SIGN_SECRET, (err, user) => {
    if (err) return res.status(403).json({
      error: 'Token Invalide !'
    })
    req.user = user;
   return next();
  })
}
module.exports = userConnected
