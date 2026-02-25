const jwt = require("jsonwebtoken");
const env = require("../config/env");

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded; // ⚠️ Importante: usa req.user no req.userId
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

module.exports = { authRequired };
