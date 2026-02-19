const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { md5 } = require("../utils/md5");
const { uploadToS3 } = require("../services/storage.service");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.register = async (req, res) => {
  const { email, nombre_completo, password, confirm_password } = req.body;

  if (!email || !nombre_completo || !password || !confirm_password) {
    return res.status(400).json({ message: "Faltan campos" });
  }
  if (!isValidEmail(email)) return res.status(400).json({ message: "Email inválido" });
  if (password !== confirm_password) {
    return res.status(400).json({ message: "Las contraseñas no coinciden" });
  }

  const password_hash = md5(password);

  let foto_key = null;
  if (req.file) {
    const uploaded = await uploadToS3({ folder: "Fotos_Perfil", file: req.file });
    foto_key = uploaded.key;
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO usuarios (email, nombre_completo, password_hash, foto_perfil)
       VALUES (?, ?, ?, ?)`,
      [email, nombre_completo, password_hash, foto_key]
    );

    return res.status(201).json({
      message: "Usuario registrado",
      id_usuario: result.insertId,
      foto_perfil: foto_key ? `${env.S3_PUBLIC_BASE_URL}/${foto_key}` : null,
    });
  } catch (err) {
    if (String(err.message).includes("Duplicate")) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }
    return res.status(500).json({ message: "Error interno" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Faltan campos" });

  const [rows] = await pool.execute(
    `SELECT id_usuario, email, nombre_completo, password_hash, foto_perfil
     FROM usuarios WHERE email = ? LIMIT 1`,
    [email]
  );

  if (rows.length === 0) return res.status(401).json({ message: "Credenciales inválidas" });

  const user = rows[0];
  if (user.password_hash !== md5(password)) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  const token = jwt.sign(
    { id_usuario: user.id_usuario, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return res.json({
    message: "Login OK",
    token,
    user: {
      id_usuario: user.id_usuario,
      email: user.email,
      nombre_completo: user.nombre_completo,
      foto_perfil: user.foto_perfil ? `${env.S3_PUBLIC_BASE_URL}/${user.foto_perfil}` : null,
    },
  });
};
