const pool = require("../config/db");
const env = require("../config/env");
const { md5 } = require("../utils/md5");
const { uploadToS3 } = require("../services/storage.service");

exports.me = async (req, res) => {
  const userId = req.user.id_usuario;

  const [rows] = await pool.execute(
    `SELECT id_usuario, email, nombre_completo, foto_perfil, fecha_registro
     FROM usuarios WHERE id_usuario = ?`,
    [userId]
  );

  if (rows.length === 0) return res.status(404).json({ message: "Usuario no existe" });

  const u = rows[0];
  return res.json({
    user: {
      ...u,
      foto_perfil: u.foto_perfil ? `${env.S3_PUBLIC_BASE_URL}/${u.foto_perfil}` : null,
    },
  });
};

exports.update = async (req, res) => {
  const userId = req.user.id_usuario;
  const { nombre_completo, current_password } = req.body;

  if (!current_password) {
    return res.status(400).json({ message: "current_password es obligatorio" });
  }

  const [rows] = await pool.execute(
    `SELECT password_hash FROM usuarios WHERE id_usuario = ?`,
    [userId]
  );
  if (rows.length === 0) return res.status(404).json({ message: "Usuario no existe" });
  if (rows[0].password_hash !== md5(current_password)) {
    return res.status(401).json({ message: "Contraseña actual incorrecta" });
  }

  let foto_key = null;
  if (req.file) {
    const uploaded = await uploadToS3({ folder: "Fotos_Perfil", file: req.file });
    foto_key = uploaded.key;
  }

  await pool.execute(
    `UPDATE usuarios
     SET nombre_completo = COALESCE(?, nombre_completo),
         foto_perfil = COALESCE(?, foto_perfil)
     WHERE id_usuario = ?`,
    [nombre_completo || null, foto_key || null, userId]
  );

  return res.json({ message: "Perfil actualizado" });
};
